import {
  createAdminSession,
  loginAttempt,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { sameOrigin, fail, HttpError } from "@/lib/security";
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const attempt = await loginAttempt(req);
    if (!attempt.allowed)
      throw new HttpError(
        "Muitas tentativas. Tente novamente em 15 minutos.",
        429,
      );
    if (Number(req.headers.get("content-length") || 0) > 4096)
      throw new HttpError("Dados inválidos.");
    const reader = req.body?.getReader();
    let text = "";
    let bytes = 0;
    if (!reader) throw new HttpError("Informe o acesso e a senha.");
    const decoder = new TextDecoder();
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 4096) {
        await reader.cancel();
        throw new HttpError("Dados inválidos.");
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      throw new HttpError("Dados inválidos.");
    }
    if (
      typeof body?.username !== "string" ||
      typeof body?.password !== "string" ||
      !body.username.trim() ||
      body.username.length > 64 ||
      !body.password ||
      body.password.length > 256
    )
      throw new HttpError("Informe o acesso e a senha.");
    if (!verifyAdminPassword(body.username.trim(), body.password))
      throw new HttpError("Acesso ou senha incorretos.", 401);
    return Response.json(
      { ok: true },
      {
        headers: {
          "Cache-Control": "no-store",
          "Set-Cookie": await createAdminSession(req, attempt.key),
        },
      },
    );
  } catch (e) {
    return fail(e);
  }
}
