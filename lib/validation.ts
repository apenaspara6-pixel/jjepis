import { z } from "zod";
import { slugify } from "./catalog";
export const asset = z
  .string()
  .max(2000)
  .refine(
    (v) =>
      !v ||
      /^\/api\/media\/[a-f0-9-]+$/.test(v) ||
      /^\/images\/[a-zA-Z0-9_.-]+$/.test(v) ||
      /^https:\/\/cdn\.shopify\.com\//.test(v),
    "Imagem deve ser um upload válido ou imagem Shopify.",
  );
const productFields = z
  .object({
    id: z.string().max(200),
    name: z.string().trim().min(3).max(180),
    slug: z
      .string()
      .transform(slugify)
      .pipe(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Informe um endereço com letras ou números.").max(200)),
    category: z.string().min(1).max(120),
    subcategory: z.string().max(120),
    description: z.string().max(16000),
    shortDescription: z.string().max(500),
    sku: z.string().max(120),
    price: z.number().min(0).max(9999999),
    comparePrice: z.number().min(0).max(9999999),
    stock: z.number().int().min(0).max(999999),
    weight: z.string().max(80),
    dimensions: z.string().max(120),
    specifications: z.record(z.string().max(2000)),
    status: z.enum(["active", "hidden"]),
    tags: z.array(z.string().max(100)).max(40),
    images: z.array(asset).max(20),
    featured: z.boolean(),
    related: z.array(z.string().max(200)).max(20),
    variants: z
      .array(
        z.object({
          id: z.string().max(100),
          title: z.string().min(1).max(180),
          price: z.number().min(0).max(9999999),
          stock: z.number().int().min(0).max(999999),
        }),
      )
      .max(100),
    demo: z.boolean(),
    createdAt: z.number(),
    riskClass: z.string().max(30).optional(),
  })
  .refine(
    (p) => p.comparePrice === 0 || p.comparePrice > p.price,
    { message: "O preço anterior deve ser maior que o preço de venda.", path: ["comparePrice"] },
  );
export const productSchema = z.preprocess((input) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) return input;
  const product = input as Record<string, unknown>;
  if (typeof product.slug === "string" && !product.slug.trim()) {
    return { ...product, slug: product.name };
  }
  return input;
}, productFields);

const productLabels: Record<string, string> = {
  id: "Código interno", name: "Nome do produto", slug: "Endereço do produto",
  category: "Categoria", subcategory: "Subcategoria", description: "Descrição completa",
  shortDescription: "Descrição curta", sku: "Código / SKU", price: "Preço de venda",
  comparePrice: "Preço anterior", stock: "Estoque", weight: "Peso", dimensions: "Dimensões",
  specifications: "Especificações", status: "Status", tags: "Tags", images: "Imagens",
  featured: "Produto em destaque", related: "Produtos relacionados", variants: "Variantes",
  demo: "Cadastro demonstrativo", createdAt: "Data de cadastro", riskClass: "Classe de risco",
  title: "Modelo",
};
export function productValidationIssues(error: z.ZodError) {
  return error.issues.map((issue) => {
    const label = issue.path.map((part) => typeof part === "number" ? String(part + 1) : productLabels[part] || part).join(" · ") || "Produto";
    let message = "Confira o valor informado.";
    if (issue.code === "custom") message = issue.message;
    else if (issue.code === "invalid_string" && issue.validation === "regex") message = "Use letras, números e hífens no endereço.";
    else if (issue.code === "invalid_type") message = issue.expected === "integer" ? "Informe um número inteiro." : issue.expected === "number" ? "Informe um número válido." : "Preencha este campo corretamente.";
    else if (issue.code === "too_small") message = issue.type === "string" ? `Use pelo menos ${issue.minimum} caracteres.` : issue.type === "array" ? `Adicione pelo menos ${issue.minimum} itens.` : `Informe um valor a partir de ${issue.minimum}.`;
    else if (issue.code === "too_big") message = issue.type === "string" ? `Use no máximo ${issue.maximum} caracteres.` : issue.type === "array" ? `Use no máximo ${issue.maximum} itens.` : `Informe um valor até ${issue.maximum}.`;
    return { path: issue.path.join("."), message: `${label}: ${message}` };
  });
}
const link = z
  .string()
  .max(1000)
  .refine((v) => !v || /^https:\/\//.test(v));
export const settingsSchema = z.object({
  name: z.string().min(2).max(100),
  tagline: z.string().max(160),
  logo: asset,
  whatsapp: z.string().regex(/^$|^[0-9+ ()-]{10,25}$/),
  phone: z.string().max(40),
  email: z.union([z.string().email(), z.literal("")]),
  address: z.string().max(500),
  instagram: link,
  facebook: link,
  hero: asset,
  secondaryBanner: asset,
  ga: z.string().regex(/^$|^G-[A-Z0-9]+$/),
  gtm: z.string().regex(/^$|^GTM-[A-Z0-9]+$/),
  pixel: z.string().regex(/^$|^\d{5,30}$/),
  marketing: z.string().max(300),
  privacy: z.string().max(30000),
  terms: z.string().max(30000),
  returns: z.string().max(30000),
});
export const categorySchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(120),
  name: z.string().min(2).max(120),
  description: z.string().max(300),
  image: asset,
});
