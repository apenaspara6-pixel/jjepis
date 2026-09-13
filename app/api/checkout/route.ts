import { readCart, cartDetails } from "@/lib/cart";
import { sameOrigin, jsonBody, fail, HttpError } from "@/lib/security";
import { shopifyReady, createCheckout } from "@/lib/shopify";
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    if (!shopifyReady())
      throw new HttpError(
        "O checkout será liberado após a conexão com a Shopify. Por enquanto, solicite um orçamento.",
        409,
      );
    const b = await jsonBody(req);
    const lines = await cartDetails((await readCart()).lines);
    if (!lines.length) throw new HttpError("Adicione produtos ao carrinho.");
    if (
      lines.some(
        (l) => l?.product.demo || !l?.variantId || l.quantity > l.product.stock,
      )
    )
      throw new HttpError("Revise os itens e a disponibilidade do carrinho.");
    const c = await createCheckout(
      lines.map((l) => ({ id: l!.variantId, quantity: l!.quantity })),
      typeof b.coupon === "string" ? b.coupon.slice(0, 50) : "",
    );
    return Response.json(c);
  } catch (e) {
    return fail(e);
  }
}
