import "server-only";

type Statement = { sql: string; values: unknown[] };
function storageOrigin() {
  const value = process.env.STORAGE_BRIDGE_URL;
  if (!value || !process.env.STORAGE_BRIDGE_SECRET) throw Error("Storage connection unavailable");
  const url = new URL(value);
  if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.hostname === "localhost")) throw Error("Storage connection requires HTTPS");
  return url.origin;
}
async function execute(statements: Statement[]) {
  const response = await fetch(storageOrigin() + "/api/platform/database", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + process.env.STORAGE_BRIDGE_SECRET },
    body: JSON.stringify({ statements }),
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw Error("Storage request failed (" + response.status + ")");
  return response.json() as Promise<{ results: unknown[] }[]>;
}
class RemoteStatement {
  constructor(readonly sql: string, readonly values: unknown[] = []) {}
  bind(...values: unknown[]) { return new RemoteStatement(this.sql, values); }
  async all<T>() { return (await execute([this]))[0] as { results: T[] }; }
  async first<T>() { return (await this.all<T>()).results[0] ?? null; }
  async run() { return (await execute([this]))[0]; }
}
const DB = {
  prepare(sql: string) { return new RemoteStatement(sql); },
  batch(statements: RemoteStatement[]) { return execute(statements); },
};
const BUCKET = {
  async get(id: string) {
    if (!/^[a-f0-9-]{36}$/.test(id)) return null;
    const response = await fetch(storageOrigin() + "/api/media/" + id, { cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (response.status === 404) return null;
    if (!response.ok) throw Error("Image unavailable");
    return { body: response.body, httpMetadata: { contentType: response.headers.get("content-type") }, httpEtag: response.headers.get("etag") || "" };
  },
  async put(id: string, bytes: Uint8Array, options: { httpMetadata: { contentType: string } }) {
    if (!/^[a-f0-9-]{36}$/.test(id)) throw Error("Invalid image identifier");
    const response = await fetch(storageOrigin() + "/api/platform/media/" + id, {
      method: "PUT",
      headers: { "Content-Type": options.httpMetadata.contentType, Authorization: "Bearer " + process.env.STORAGE_BRIDGE_SECRET },
      body: bytes as BodyInit,
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw Error("Image upload failed");
  },
};
export const env = new Proxy({} as Record<string, unknown>, {
  get(_target, key: string) {
    if (key === "DB") return DB;
    if (key === "BUCKET") return BUCKET;
    if (key === "STORAGE_BRIDGE_ENABLED") return undefined;
    return process.env[key];
  },
});
