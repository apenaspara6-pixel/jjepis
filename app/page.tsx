import { Home } from "@/components/store/home";
import { listProducts, getSettings, listCategories } from "@/lib/repository";
export const dynamic = "force-dynamic";
export default async function Page() {
  const [products, settings, categories] = await Promise.all([
    listProducts(),
    getSettings(),
    listCategories(),
  ]);
  return (
    <Home products={products} settings={settings} categories={categories} />
  );
}
