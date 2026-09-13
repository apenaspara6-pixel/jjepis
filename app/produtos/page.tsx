import { Catalog } from "@/components/store/catalog-view";
import { listProducts, listCategories } from "@/lib/repository";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Catálogo de produtos",
  description:
    "Encontre painéis, rótulos, conexões, sinalização e equipamentos de proteção na JJ Epi’s.",
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const [sp, products, categories] = await Promise.all([
    searchParams,
    listProducts(),
    listCategories(),
  ]);
  return (
    <Catalog
      products={products}
      categories={categories}
      query={sp.q || ""}
      group={sp.grupo || ""}
    />
  );
}
