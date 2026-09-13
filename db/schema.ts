import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
export const products = sqliteTable(
  "products",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    status: text("status").notNull(),
    stock: integer("stock").notNull(),
    createdAt: integer("created_at").notNull(),
    data: text("data").notNull(),
  },
  (t) => [index("idx_products_status_stock").on(t.status, t.stock)],
);
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  data: text("data").notNull(),
});
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  role: text("role").notNull(),
});
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  data: text("data").notNull(),
  createdAt: integer("created_at").notNull(),
});
export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  data: text("data").notNull(),
  createdAt: integer("created_at").notNull(),
});
export const carts = sqliteTable("carts", {
  id: text("id").primaryKey(),
  data: text("data").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
export const uploads = sqliteTable("uploads", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: integer("created_at").notNull(),
});
export const rateLimits = sqliteTable("rate_limits", {
  id: text("id").primaryKey(),
  count: integer("count").notNull(),
  expires: integer("expires").notNull(),
});
