import { env } from "cloudflare:workers";
import { type Product, normalize, slugify } from "./catalog";
const conf = () => env as any;
export const shopifyReady = () =>
  !!(conf().SHOPIFY_STORE_DOMAIN && conf().SHOPIFY_STOREFRONT_TOKEN);
export function shopDomain() {
  const d = conf().SHOPIFY_STORE_DOMAIN || "";
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(d))
    throw Error("Domínio Shopify inválido.");
  return d;
}
export async function shopify(
  query: string,
  variables: Record<string, unknown> = {},
  admin = false,
) {
  const c = conf();
  const token = admin ? c.SHOPIFY_ADMIN_TOKEN : c.SHOPIFY_STOREFRONT_TOKEN;
  if (!token) throw Error("Shopify ainda não conectada.");
  const r = await fetch(
    "https://" +
      shopDomain() +
      (admin ? "/admin" : "") +
      "/api/2026-07/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [admin
          ? "X-Shopify-Access-Token"
          : "X-Shopify-Storefront-Access-Token"]: token,
      },
      body: JSON.stringify({ query, variables }),
    },
  );
  if (!r.ok) throw Error("Não foi possível consultar a Shopify.");
  const j: any = await r.json();
  if (j.errors?.length)
    throw Error(
      "A Shopify recusou a consulta. Verifique os escopos da integração.",
    );
  return j.data;
}
export async function shopifyProducts(): Promise<Product[]> {
  const all: any[] = [];
  let cursor = null;
  for (let page = 0; page < 40; page++) {
    const d: any = await shopify(
      `query($cursor:String){products(first:100,after:$cursor,sortKey:BEST_SELLING){pageInfo{hasNextPage endCursor}nodes{id title handle description productType tags createdAt images(first:20){nodes{url}} variants(first:100){nodes{id title sku availableForSale quantityAvailable price{amount currencyCode} compareAtPrice{amount}}}}}}`,
      { cursor },
    );
    all.push(...d.products.nodes);
    if (!d.products.pageInfo.hasNextPage) break;
    cursor = d.products.pageInfo.endCursor;
  }
  return all.map((p, salesRank) => {
    const v = p.variants.nodes[0];
    if (v?.price.currencyCode !== "BRL")
      throw Error("Configure o catálogo Shopify em BRL.");
    return {
      id: p.id,
      name: p.title,
      slug: p.handle,
      category: shopifyCategory(p.productType, p.tags),
      subcategory: "",
      description: p.description,
      shortDescription: p.description.slice(0, 180),
      sku: v?.sku || "",
      price: Number(v?.price.amount || 0),
      comparePrice: Number(v?.compareAtPrice?.amount || 0),
      stock: v?.quantityAvailable ?? (v?.availableForSale ? 1 : 0),
      weight: "",
      dimensions: "",
      specifications: {},
      status: "active",
      tags: p.tags,
      images: p.images.nodes.map((x: any) => x.url),
      riskClass:
        p.tags.find((t: string) => /^classe:[0-9]+$/.test(t))?.split(":")[1] ||
        "",
      featured: p.tags.includes("destaque"),
      related: [],
      variants: p.variants.nodes.map((v: any) => ({
        id: v.id,
        title: v.title,
        price: Number(v.price.amount),
        stock: v.quantityAvailable ?? (v.availableForSale ? 1 : 0),
      })),
      demo: false,
      source: "shopify",
      salesRank,
      createdAt: Date.parse(p.createdAt),
    } as Product;
  });
}
export async function createCheckout(
  lines: { id: string; quantity: number }[],
  discount: string,
) {
  const d = await shopify(
    `mutation($input:CartInput!){cartCreate(input:$input){cart{checkoutUrl cost{subtotalAmount{amount} totalAmount{amount}} discountCodes{code applicable}} userErrors{message}}}`,
    {
      input: {
        lines: lines.map((x) => ({
          merchandiseId: x.id,
          quantity: x.quantity,
        })),
        discountCodes: discount ? [discount] : [],
      },
    },
  );
  if (d.cartCreate.userErrors.length)
    throw Error(d.cartCreate.userErrors.map((x: any) => x.message).join(" "));
  if (
    discount &&
    !d.cartCreate.cart.discountCodes.every((x: any) => x.applicable)
  )
    throw Error("Cupom não aplicável a este carrinho.");
  return d.cartCreate.cart;
}

export function shopifyCategory(type: string, tags: string[]) {
  const explicit = tags.find((t) => t.startsWith("categoria:"))?.slice(10);
  const value = slugify(explicit || type || "acessorios");
  if (
    [
      "paineis-de-seguranca",
      "rotulos-de-risco",
      "conexoes",
      "protecao",
      "sinalizacao",
      "acessorios",
    ].includes(value)
  )
    return value;
  const name = normalize(type);
  if (/painel|paineis/.test(name)) return "paineis-de-seguranca";
  if (/rotulo|risco/.test(name)) return "rotulos-de-risco";
  if (/conex|conector|engate|mangueira/.test(name)) return "conexoes";
  if (/protecao|luva|epi|equipamento/.test(name)) return "protecao";
  if (/sinal|cone|placa/.test(name)) return "sinalizacao";
  return explicit || "acessorios";
}
