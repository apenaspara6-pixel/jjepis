import { env } from "@/lib/platform";
import { adminUser, sameOrigin, fail, HttpError } from "@/lib/security";
import { database } from "@/lib/repository";
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    await adminUser();
    if (Number(req.headers.get("content-length") || 0) > 6000000)
      throw new HttpError("Limite de 5 MB por imagem.", 413);
    const form = await req.formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size > 5 * 1024 * 1024 ||
      file.size === 0
    )
      throw new HttpError("Selecione uma imagem de até 5 MB.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    let type = "";
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
      type = "image/jpeg";
    if (
      bytes[0] === 137 &&
      bytes[1] === 80 &&
      bytes[2] === 78 &&
      bytes[3] === 71
    )
      type = "image/png";
    if (
      new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
      new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
    )
      type = "image/webp";
    if (!type) throw new HttpError("Use uma imagem JPEG, PNG ou WebP válida.");
    const bucket = (env as any).BUCKET as R2Bucket;
    if (!bucket) throw new HttpError("Upload indisponível no momento.", 503);
    const id = crypto.randomUUID();
    await bucket.put(id, bytes, {
      httpMetadata: {
        contentType: type,
        cacheControl: "public, max-age=31536000, immutable",
      },
    });
    await database()
      .prepare("INSERT INTO uploads(id,name,created_at) VALUES(?,?,?)")
      .bind(id, file.name.slice(0, 200), Date.now())
      .run();
    return Response.json({ url: "/api/media/" + id, id, name: file.name });
  } catch (e) {
    return fail(e);
  }
}
