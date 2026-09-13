import { getAdminSession } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/login-form";
import { getSettings, listProducts, listCategories } from "@/lib/repository";
import { shopifyReady } from "@/lib/shopify";
import { AdminApp } from "@/components/admin/admin-app";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Administração | JJ Epi’s",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path } = await params;
  const user = await getAdminSession();
  if (!user) return <AdminLogin />;
  const [products, categories, settings] = await Promise.all([
    listProducts(true),
    listCategories(),
    getSettings(),
  ]);
  const valid = [
    "dashboard",
    "produtos",
    "categorias",
    "pedidos",
    "clientes",
    "cupons",
    "imagens",
    "mensagens",
    "configuracoes",
    "integracoes",
    "shopify",
  ];
  const section = valid.includes(path?.[0] || "") ? path![0] : "dashboard";
  return (
    <AdminApp
      section={section}
      initialProducts={products}
      initialCategories={categories}
      initialSettings={settings}
      email={user.username}
      connected={shopifyReady()}
    />
  );
}
