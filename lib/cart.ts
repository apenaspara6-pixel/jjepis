import { cookies } from "next/headers";
import { database, listProducts } from "./repository";
import { HttpError } from "./security";
export type CartLine = {
  productId: string;
  variantId: string;
  quantity: number;
};
export async function readCart() {
  const c = await cookies();
  const id = c.get("jj_cart")?.value || "";
  if (!/^[a-f0-9-]{36}$/.test(id)) return { id: "", lines: [] as CartLine[] };
  const row = await database()
    .prepare("SELECT data FROM carts WHERE id=?")
    .bind(id)
    .first<{ data: string }>();
  return { id, lines: row ? (JSON.parse(row.data) as CartLine[]) : [] };
}
export async function cartDetails(lines: CartLine[]) {
  const ps = await listProducts();
  return lines
    .map((l) => {
      const p = ps.find((p) => p.id === l.productId);
      if (!p) return null;
      const v = p.variants.find((v) => v.id === l.variantId);
      return {
        product: v ? { ...p, price: v.price, stock: v.stock } : p,
        quantity: l.quantity,
        variantId: l.variantId,
      };
    })
    .filter(Boolean);
}
export async function updateCart(b: any) {
  const cart = await readCart();
  let lines = cart.lines;
  if (b.action === "add") {
    if (!Number.isInteger(b.quantity) || b.quantity < 1 || b.quantity > 99)
      throw new HttpError("Quantidade inválida.");
    const p = (await listProducts()).find((p) => p.id === b.productId);
    if (!p) throw new HttpError("Produto não encontrado.", 404);
    const variantId = b.variantId || "";
    if (p.variants.length && !p.variants.some((v) => v.id === variantId))
      throw new HttpError("Selecione uma variante válida.");
    const stock = p.variants.find((v) => v.id === variantId)?.stock ?? p.stock;
    const line = lines.find(
      (l) => l.productId === p.id && l.variantId === variantId,
    );
    const qty = (line?.quantity || 0) + b.quantity;
    if (qty > 99 || (!p.demo && qty > stock))
      throw new HttpError("Quantidade acima da disponibilidade.");
    if (line) line.quantity = qty;
    else lines.push({ productId: p.id, quantity: qty, variantId });
  } else if (b.action === "update") {
    if (
      !Number.isInteger(b.index) ||
      !lines[b.index] ||
      !Number.isInteger(b.quantity) ||
      b.quantity < 0 ||
      b.quantity > 99
    )
      throw new HttpError("Quantidade inválida.");
    lines[b.index].quantity = b.quantity;
    lines = lines.filter((l) => l.quantity > 0);
    const details = await cartDetails(lines);
    if (
      details.some((l) => l && !l.product.demo && l.quantity > l.product.stock)
    )
      throw new HttpError("Quantidade acima da disponibilidade.");
  } else throw new HttpError("Ação inválida.");
  if (lines.length > 100) throw new HttpError("Limite de itens atingido.");
  const id = cart.id || crypto.randomUUID();
  await database()
    .prepare(
      "INSERT INTO carts(id,data,updated_at) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at",
    )
    .bind(id, JSON.stringify(lines), Date.now())
    .run();
  return { id, lines: await cartDetails(lines) };
}
