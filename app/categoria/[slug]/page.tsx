import { Catalog } from "@/components/store/catalog-view";
import { listProducts, listCategories } from "@/lib/repository";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = (await listCategories()).find((c) => c.id === slug);
  return { title: c?.name || "Categoria", description: c?.description };
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const [{ slug }, sp, products, categories] = await Promise.all([
    params,
    searchParams,
    listProducts(),
    listCategories(),
  ]);
  if (!categories.some((c) => c.id === slug)) notFound();
  return (
    <Catalog
      products={products}
      categories={categories}
      category={slug}
      risk={sp.classe || ""}
    />
  );
}
