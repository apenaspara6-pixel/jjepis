import { env } from "@/lib/platform";
export async function GET(
  _r: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id))
    return new Response("Não encontrado", { status: 404 });
  try {
    const o = await ((env as any).BUCKET as R2Bucket).get(id);
    if (!o) return new Response("Não encontrado", { status: 404 });
    return new Response(o.body, {
      headers: {
        "Content-Type":
          o.httpMetadata?.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        ETag: o.httpEtag,
      },
    });
  } catch {
    return new Response("Imagem indisponível", { status: 503 });
  }
}
