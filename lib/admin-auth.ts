import { env } from "@/lib/platform";
import { cookies } from "next/headers";
import {
  createHash,
  createHmac,
  pbkdf2Sync,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { database } from "./repository";
import { requestIp } from "./request-ip";

const SESSION_SECONDS = 8 * 60 * 60;
export const ADMIN_COOKIE = "jj_admin_session";
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
function config() {
  const value = env as {
    ADMIN_USERNAME?: string;
    ADMIN_PASSWORD_HASH?: string;
    ADMIN_PASSWORD_PEPPER?: string;
  };
  const username = value.ADMIN_USERNAME || "";
  const passwordHash = value.ADMIN_PASSWORD_HASH || "";
  const pepper = value.ADMIN_PASSWORD_PEPPER || "";
  if (
    !username ||
    !/^[a-f0-9]{64}$/.test(pepper) ||
    !/^pbkdf2-sha256-peppered:100000:[a-f0-9]{32}:[a-f0-9]{64}$/.test(
      passwordHash,
    )
  )
    return null;
  return {
    username,
    passwordHash,
    pepper,
    version: hash(username + "\0" + passwordHash + "\0" + pepper),
  };
}
export async function getAdminSession() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value || "";
  const c = config();
  if (!c || !/^[a-f0-9]{64}$/.test(token)) return null;
  const row = await database()
    .prepare(
      "SELECT username,credential_version FROM admin_sessions WHERE id=? AND expires_at>?",
    )
    .bind(hash(token), Date.now())
    .first<{ username: string; credential_version: string }>();
  if (
    !row ||
    row.credential_version !== c.version ||
    row.username !== c.username
  )
    return null;
  return { userId: "store-administrator", email: "", username: row.username };
}
export function verifyAdminPassword(username: string, password: string) {
  const c = config();
  if (!c) return false;
  const [, , salt, expected] = c.passwordHash.split(":");
  const actual = pbkdf2Sync(
    password,
    Buffer.from(salt, "hex"),
    100000,
    32,
    "sha256",
  );
  const protectedHash = createHmac("sha256", Buffer.from(c.pepper, "hex"))
    .update(actual)
    .digest();
  const passwordMatches = timingSafeEqual(
    protectedHash,
    Buffer.from(expected, "hex"),
  );
  const userMatches = timingSafeEqual(
    Buffer.from(hash(username), "hex"),
    Buffer.from(hash(c.username), "hex"),
  );
  return passwordMatches && userMatches;
}
export async function loginAttempt(req: Request) {
  const key =
    "admin-login:" +
    (config()?.version || "unconfigured") +
    ":" +
    hash(requestIp(req));
  const now = Date.now();
  const row = await database()
    .prepare(
      "INSERT INTO rate_limits(id,count,expires) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET count=CASE WHEN expires<=? THEN 1 ELSE count+1 END, expires=CASE WHEN expires<=? THEN excluded.expires ELSE expires END RETURNING count",
    )
    .bind(key, now + 15 * 60000, now, now)
    .first<{ count: number }>();
  return { key, allowed: (row?.count || 0) <= 10 };
}
export async function createAdminSession(req: Request, attemptKey: string) {
  const c = config();
  if (!c) throw Error("Admin credentials unavailable");
  const db = database();
  const old = (await cookies()).get(ADMIN_COOKIE)?.value || "";
  const token = randomBytes(32).toString("hex");
  await db.batch([
    db
      .prepare("DELETE FROM admin_sessions WHERE expires_at<=? OR id=?")
      .bind(Date.now(), hash(old)),
    db.prepare("DELETE FROM rate_limits WHERE id=?").bind(attemptKey),
    db
      .prepare(
        "INSERT INTO admin_sessions(id,username,credential_version,expires_at) VALUES(?,?,?,?)",
      )
      .bind(
        hash(token),
        c.username,
        c.version,
        Date.now() + SESSION_SECONDS * 1000,
      ),
  ]);
  return sessionCookie(req, token, SESSION_SECONDS);
}
export async function endAdminSession(req: Request) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value || "";
  if (/^[a-f0-9]{64}$/.test(token))
    await database()
      .prepare("DELETE FROM admin_sessions WHERE id=?")
      .bind(hash(token))
      .run();
  return sessionCookie(req, "", 0);
}
function sessionCookie(req: Request, token: string, maxAge: number) {
  return (
    ADMIN_COOKIE +
    "=" +
    token +
    "; Path=/; HttpOnly; SameSite=Strict; Max-Age=" +
    maxAge +
    (new URL(req.url).protocol === "https:" ? "; Secure" : "")
  );
}
