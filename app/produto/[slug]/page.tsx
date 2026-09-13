import { listProducts, listCategories } from "@/lib/repository";
import { origin } from "@/lib/catalog";
import { ProductDetail } from "@/components/store/product-detail";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = (await listProducts()).find((p) => p.slug === slug);
  return {
    title: p?.name || "Produto",
    description: p?.shortDescription,
    alternates: { canonical: origin + "/produto/" + slug },
    robots: p?.demo ? { index: false, follow: true } : undefined,
    openGraph: {
      title: p?.name,
      description: p?.shortDescription,
      type: "website",
      url: origin + "/produto/" + slug,
      ...(p?.images[0] ? { images: [new URL(p.images[0], origin).href] } : {}),
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, products, categories] = await Promise.all([
    params,
    listProducts(),
    listCategories(),
  ]);
  const p = products.find((p) => p.slug === slug);
  if (!p) notFound();
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      description: p.shortDescription,
      sku: p.sku,
      ...(p.images.length
        ? { image: p.images.map((i) => new URL(i, origin).href) }
        : {}),
      ...(!p.demo
        ? {
            offers: {
              "@type": "Offer",
              price: p.price,
              priceCurrency: "BRL",
              availability:
                p.stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              url: origin + "/produto/" + slug,
            },
          }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: origin },
        {
          "@type": "ListItem",
          position: 2,
          name: "Produtos",
          item: origin + "/produtos",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: p.name,
          item: origin + "/produto/" + slug,
        },
      ],
    },
  ];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <ProductDetail product={p} products={products} categories={categories} />
    </>
  );
}
