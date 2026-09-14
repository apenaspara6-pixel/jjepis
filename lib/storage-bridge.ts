import { env } from "@/lib/platform";
import { createHash, timingSafeEqual } from "node:crypto";

export function storageAuthorized(request: Request) {
  const secret = (env as any).STORAGE_BRIDGE_SECRET;
  if ((env as any).STORAGE_BRIDGE_ENABLED !== "true" || !/^[a-f0-9]{64}$/.test(secret || "")) return false;
  const authorization = request.headers.get("authorization") || "";
  const hash = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(authorization), hash("Bearer " + secret));
}
export async function boundedBody(request: Request, limit: number) {
  if (Number(request.headers.get("content-length") || 0) > limit) throw Error("Body too large");
  const reader = request.body?.getReader();
  if (!reader) throw Error("Missing body");
  const parts: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) { await reader.cancel(); throw Error("Body too large"); }
    parts.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) { bytes.set(part, offset); offset += part.length; }
  return bytes;
}
