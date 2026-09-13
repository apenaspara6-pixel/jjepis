import { z } from "zod";
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
export const productSchema = z
  .object({
    id: z.string().max(200),
    name: z.string().trim().min(3).max(180),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(200),
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
    "O preço anterior deve ser maior que o preço de venda.",
  );
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
