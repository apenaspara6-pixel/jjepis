import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { database } from "./repository";
export class HttpError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function adminUser() {
  const u = await getChatGPTUser();
  if (!u) throw new HttpError("Entre com sua conta para continuar.", 401);
  const allowed = String((env as any).ADMIN_EMAILS || "")
    .split(",")
    .map((s: string) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!allowed.includes(u.email.toLowerCase()))
    throw new HttpError("Esta conta não tem permissão administrativa.", 403);
  return u;
}
export function sameOrigin(req: Request) {
  const o = req.headers.get("origin");
  if (!o || o !== new URL(req.url).origin)
    throw new HttpError("Origem da solicitação inválida.", 403);
}
export async function jsonBody(req: Request) {
  const s = await req.text();
  if (s.length > 150000) throw new HttpError("Conteúdo muito grande.", 413);
  try {
    return JSON.parse(s);
  } catch {
    throw new HttpError("Dados inválidos.");
  }
}
export function fail(e: unknown) {
  const status = e instanceof HttpError ? e.status : 500;
  console.error("Request failed", e instanceof Error ? e.message : "Unknown");
  return Response.json(
    {
      error:
        status === 500
          ? "Não foi possível concluir. Tente novamente."
          : (e as Error).message,
    },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
export async function rateLimit(req: Request, scope: string, limit: number) {
  const ip = req.headers.get("cf-connecting-ip") || "local";
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(ip),
  );
  const key =
    scope +
    ":" +
    Array.from(new Uint8Array(hash), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("") +
    ":" +
    Math.floor(Date.now() / 3600000);
  const r = await database()
    .prepare(
      "INSERT INTO rate_limits(id,count,expires) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1 RETURNING count",
    )
    .bind(key, Date.now() + 3600000)
    .first<{ count: number }>();
  if ((r?.count || 0) > limit)
    throw new HttpError(
      "Muitas tentativas. Aguarde antes de tentar novamente.",
      429,
    );
}
