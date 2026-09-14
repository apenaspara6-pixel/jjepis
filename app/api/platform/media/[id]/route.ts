import { env } from "@/lib/platform";
import { storageAuthorized, boundedBody } from "@/lib/storage-bridge";
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!storageAuthorized(request)) return new Response(null, { status: 404 });
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return new Response(null, { status: 400 });
  try {
    const bytes = await boundedBody(request, 5 * 1024 * 1024);
    let contentType = "";
    if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) contentType = "image/jpeg";
    if (bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71) contentType = "image/png";
    const text = new TextDecoder();
    if (text.decode(bytes.slice(0, 4)) === "RIFF" && text.decode(bytes.slice(8, 12)) === "WEBP") contentType = "image/webp";
    if (!contentType) return new Response(null, { status: 400 });
    await ((env as any).BUCKET as R2Bucket).put(id, bytes, { httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" } });
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return new Response(null, { status: 500 });
  }
}
