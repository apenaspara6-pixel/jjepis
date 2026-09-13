import { env } from "cloudflare:workers";
import {
  categories,
  defaults,
  seedProducts,
  type Product,
  type Settings,
  type Category,
} from "./catalog";
import { shopifyReady, shopifyProducts } from "./shopify";
export function database() {
  const db = (env as any).DB as D1Database | undefined;
  if (!db) throw new Error("Armazenamento indisponível. Tente novamente.");
  return db;
}
export async function getSettings(): Promise<Settings> {
  try {
    const r = await database()
      .prepare("SELECT value FROM settings WHERE key = ?")
      .bind("company")
      .first<{ value: string }>();
    return { ...defaults, ...(r ? JSON.parse(r.value) : {}) };
  } catch {
    return defaults;
  }
}
export async function listProducts(admin = false): Promise<Product[]> {
  if (shopifyReady()) return shopifyProducts();
  try {
    const r = await database()
      .prepare("SELECT data FROM products ORDER BY created_at DESC")
      .all<{ data: string }>();
    const configured = await database()
      .prepare("SELECT value FROM settings WHERE key = ?")
      .bind("catalog_initialized")
      .first();
    if (!configured) return seedProducts;
    const ps = r.results.map((x) => JSON.parse(x.data) as Product);
    return admin ? ps : ps.filter((p) => p.status === "active");
  } catch (e) {
    if (admin) throw e;
    return seedProducts;
  }
}
export async function listCategories(): Promise<Category[]> {
  try {
    const r = await database()
      .prepare("SELECT data FROM categories ORDER BY name")
      .all<{ data: string }>();
    return r.results.length
      ? r.results
          .map((x) => JSON.parse(x.data) as Category)
          .sort((a, b) => {
            const rank = (id: string) => {
              const i = categories.findIndex((c) => c.id === id);
              return i < 0 ? 99 : i;
            };
            return rank(a.id) - rank(b.id);
          })
      : categories;
  } catch {
    return categories;
  }
}
export async function initializeCatalog() {
  const db = database();
  const done = await db
    .prepare("SELECT value FROM settings WHERE key=?")
    .bind("catalog_initialized")
    .first();
  if (done) return;
  await db.batch([
    ...seedProducts.map((p) =>
      db
        .prepare(
          "INSERT OR IGNORE INTO products(id,slug,status,stock,created_at,data) VALUES(?,?,?,?,?,?)",
        )
        .bind(p.id, p.slug, p.status, p.stock, p.createdAt, JSON.stringify(p)),
    ),
    ...categories.map((c) =>
      db
        .prepare("INSERT OR IGNORE INTO categories(id,name,data) VALUES(?,?,?)")
        .bind(c.id, c.name, JSON.stringify(c)),
    ),
    db
      .prepare("INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)")
      .bind("catalog_initialized", "true"),
  ]);
}
