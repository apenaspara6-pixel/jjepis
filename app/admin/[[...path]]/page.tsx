import { getChatGPTUser, chatGPTSignInPath } from "@/app/chatgpt-auth";
import { adminUser } from "@/lib/security";
import { getSettings, listProducts, listCategories } from "@/lib/repository";
import { shopifyReady } from "@/lib/shopify";
import { AdminApp } from "@/components/admin/admin-app";
import { ShieldCheck, LockKeyhole } from "lucide-react";
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
  const user = await getChatGPTUser();
  if (!user)
    return (
      <main className="admin-login">
        <div>
          <ShieldCheck size={45} />
          <span className="eyebrow accent">JJ EPI'S · ADMINISTRAÇÃO</span>
          <h1>
            Sua operação.
            <br />
            Em boas mãos.
          </h1>
          <p>
            Entre com a conta autorizada para gerenciar produtos, preços,
            estoque e imagens.
          </p>
          <a className="btn" href={chatGPTSignInPath("/admin")} target="_top">
            <LockKeyhole size={17} />
            Entrar com ChatGPT
          </a>
          <a href="/" className="text-link">
            Voltar à loja
          </a>
        </div>
      </main>
    );
  try {
    await adminUser();
  } catch {
    return (
      <main className="admin-login">
        <div>
          <LockKeyhole size={45} />
          <h1>Acesso restrito.</h1>
          <p>
            A conta {user.email} não tem permissão para administrar esta loja.
          </p>
          <a
            className="btn"
            href="/signout-with-chatgpt?return_to=%2Fadmin"
            target="_top"
          >
            Entrar com outra conta
          </a>
          <a href="/" className="text-link">
            Voltar à loja
          </a>
        </div>
      </main>
    );
  }
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
      email={user.email}
      connected={shopifyReady()}
    />
  );
}
