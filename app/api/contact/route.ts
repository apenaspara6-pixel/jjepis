import { z } from "zod";
import { database } from "@/lib/repository";
import { readCart, cartDetails } from "@/lib/cart";
import {
  sameOrigin,
  jsonBody,
  fail,
  HttpError,
  rateLimit,
} from "@/lib/security";
const schema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().max(160),
  phone: z.string().trim().min(8).max(30),
  email: z.string().email().max(180),
  subject: z.string().min(3).max(180),
  message: z.string().min(10).max(5000),
  website: z.string().max(0),
});
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const result = schema.safeParse(await jsonBody(req));
    if (!result.success)
      throw new HttpError(
        "Confira os campos. Nome, telefone, e-mail e mensagem são obrigatórios.",
      );
    await rateLimit(req, "contact", 8);
    const id = crypto.randomUUID();
    const cart = await cartDetails((await readCart()).lines);
    await database()
      .prepare("INSERT INTO messages(id,data,created_at) VALUES(?,?,?)")
      .bind(id, JSON.stringify({ ...result.data, cart }), Date.now())
      .run();
    return Response.json({ ok: true, reference: id.slice(0, 8) });
  } catch (e) {
    return fail(e);
  }
}
