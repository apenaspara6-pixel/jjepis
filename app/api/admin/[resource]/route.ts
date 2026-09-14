import { env } from "@/lib/platform";
import {
  database,
  getSettings,
  listProducts,
  listCategories,
  initializeCatalog,
} from "@/lib/repository";
import {
  adminUser,
  sameOrigin,
  jsonBody,
  fail,
  HttpError,
} from "@/lib/security";
import {
  productSchema,
  productValidationIssues,
  settingsSchema,
  categorySchema,
} from "@/lib/validation";
import { shopifyReady, shopDomain, shopify } from "@/lib/shopify";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    await adminUser();
    const { resource } = await params;
    if (resource === "status") {
      let verified = false;
      let error = "";
      if (shopifyReady())
        try {
          await shopify("{shop{name}}");
          verified = true;
        } catch (e) {
          error = (e as Error).message;
        }
      return Response.json({
        connected: verified,
        configured: shopifyReady(),
        adminConfigured: !!(env as any).SHOPIFY_ADMIN_TOKEN,
        domain: shopifyReady() ? shopDomain() : "",
        error,
      });
    }
    if (resource === "settings") return Response.json(await getSettings());
    if (resource === "products") return Response.json(await listProducts(true));
    if (resource === "categories") return Response.json(await listCategories());
    if (resource === "images")
      return Response.json(
        (
          await database()
            .prepare("SELECT * FROM uploads ORDER BY created_at DESC LIMIT 500")
            .all()
        ).results,
      );
    if (resource === "messages")
      return Response.json(
        (
          await database()
            .prepare(
              "SELECT id,data,created_at FROM messages ORDER BY created_at DESC LIMIT 100",
            )
            .all<any>()
        ).results.map((r: any) => ({
          ...JSON.parse(r.data),
          id: r.id,
          createdAt: r.created_at,
        })),
      );
    if (["orders", "customers", "coupons", "dashboard"].includes(resource)) {
      if (!(env as any).SHOPIFY_ADMIN_TOKEN)
        return Response.json({
          connected: false,
          items: [],
          message: "Conecte a Shopify para consultar estes dados.",
        });
      const queries: Record<string, string> = {
        orders:
          "{orders(first:20,sortKey:CREATED_AT,reverse:true){nodes{id name createdAt displayFinancialStatus totalPriceSet{shopMoney{amount currencyCode}}}}}",
        customers:
          "{customers(first:30){nodes{id displayName email numberOfOrders}}}",
        coupons:
          "{discountNodes(first:30){nodes{id discount{... on DiscountCodeBasic{title status codes(first:1){nodes{code}}}}}}}",
        dashboard:
          "{orders(first:50,sortKey:CREATED_AT,reverse:true){nodes{id name createdAt displayFinancialStatus totalPriceSet{shopMoney{amount currencyCode}} lineItems(first:50){nodes{title quantity}}}}}",
      };
      const d = await shopify(queries[resource], {}, true);
      return Response.json({
        connected: true,
        items:
          resource === "coupons"
            ? d.discountNodes.nodes
            : resource === "customers"
              ? d.customers.nodes
              : d.orders.nodes,
        message:
          resource === "dashboard"
            ? "Resumo dos últimos 50 pedidos acessíveis pela API."
            : "",
      });
    }
    throw new HttpError("Recurso não encontrado.", 404);
  } catch (e) {
    return fail(e);
  }
}
export async function POST(
  req: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    sameOrigin(req);
    const u = await adminUser();
    const { resource } = await params;
    const b = await jsonBody(req);
    const db = database();
    if (resource === "products") {
      if (shopifyReady())
        throw new HttpError(
          "A Shopify é a fonte principal. Edite o produto pelo painel Shopify.",
          409,
        );
      await initializeCatalog();
      const parsed = productSchema.safeParse(b);
      if (!parsed.success)
        throw new HttpError(
          productValidationIssues(parsed.error)[0]?.message || "Confira os dados do produto.",
        );
      const p = parsed.data;
      p.id = p.id || crypto.randomUUID();
      if (!(await listCategories()).some((c) => c.id === p.category))
        throw new HttpError("Selecione uma categoria existente.");
      const duplicate = await db
        .prepare("SELECT id FROM products WHERE slug=? AND id<>?")
        .bind(p.slug, p.id)
        .first();
      if (duplicate)
        throw new HttpError("Este endereço já está em uso. Altere o slug.");
      await db
        .prepare(
          "INSERT INTO products(id,slug,status,stock,created_at,data) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,status=excluded.status,stock=excluded.stock,data=excluded.data",
        )
        .bind(p.id, p.slug, p.status, p.stock, p.createdAt, JSON.stringify(p))
        .run();
      await db
        .prepare(
          "INSERT INTO users(id,email,role) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET email=excluded.email",
        )
        .bind(u.userId, u.email, "admin")
        .run();
      return Response.json(p);
    }
    if (resource === "settings") {
      const s = settingsSchema.safeParse(b);
      if (!s.success)
        throw new HttpError(
          "Revise " +
            s.error.issues[0]?.path.join(".") +
            ": " +
            s.error.issues[0]?.message,
        );
      await db
        .prepare(
          "INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        )
        .bind("company", JSON.stringify(s.data))
        .run();
      return Response.json({ ok: true });
    }
    if (resource === "categories") {
      const c = categorySchema.safeParse(b);
      if (!c.success)
        throw new HttpError("Categoria inválida. Confira nome e endereço.");
      await initializeCatalog();
      await db
        .prepare(
          "INSERT INTO categories(id,name,data) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,data=excluded.data",
        )
        .bind(c.data.id, c.data.name, JSON.stringify(c.data))
        .run();
      return Response.json(c.data);
    }
    if (resource === "shopify") {
      const domain = String(b.domain || "").trim();
      if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(domain))
        throw new HttpError("Informe o domínio no formato loja.myshopify.com.");
      await db
        .prepare(
          "INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        )
        .bind("shopify_domain_requested", domain)
        .run();
      if (!shopifyReady())
        throw new HttpError(
          "Domínio salvo. Para conectar, configure SHOPIFY_STORE_DOMAIN e SHOPIFY_STOREFRONT_TOKEN no ambiente seguro do site.",
          409,
        );
      if (domain !== shopDomain())
        throw new HttpError(
          "O domínio informado difere do domínio configurado no ambiente seguro.",
        );
      const d = await shopify("{shop{name}}");
      return Response.json({ ok: true, name: d.shop.name });
    }
    throw new HttpError("Ação não encontrada.", 404);
  } catch (e) {
    return fail(e);
  }
}
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    sameOrigin(req);
    await adminUser();
    const { resource } = await params;
    const b = await jsonBody(req);
    if (resource !== "products" || typeof b.id !== "string")
      throw new HttpError("Ação inválida.");
    if (shopifyReady())
      throw new HttpError("Gerencie este produto na Shopify.", 409);
    await initializeCatalog();
    await database()
      .prepare("DELETE FROM products WHERE id=?")
      .bind(b.id)
      .run();
    return Response.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
