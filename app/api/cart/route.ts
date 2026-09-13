import { readCart, cartDetails, updateCart } from "@/lib/cart";
import { sameOrigin, jsonBody, fail } from "@/lib/security";
export async function GET() {
  try {
    return Response.json(
      { lines: await cartDetails((await readCart()).lines) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return fail(e);
  }
}
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const r = await updateCart(await jsonBody(req));
    return Response.json(
      { lines: r.lines },
      {
        headers: {
          "Cache-Control": "no-store",
          "Set-Cookie":
            "jj_cart=" +
            r.id +
            "; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000" +
            (new URL(req.url).protocol === "https:" ? "; Secure" : ""),
        },
      },
    );
  } catch (e) {
    return fail(e);
  }
}
