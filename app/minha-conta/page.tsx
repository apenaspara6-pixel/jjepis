import { shopifyReady, shopDomain } from "@/lib/shopify";
import { Shell } from "@/components/store/chrome";
import { UserRound } from "lucide-react";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Minha conta",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const connected = shopifyReady();
  return (
    <Shell>
      <div className="account-page">
        <UserRound size={44} />
        <h1>Minha conta</h1>
        <p>
          {connected
            ? "Acesse sua conta no ambiente seguro da loja para acompanhar seus pedidos."
            : "O acompanhamento de pedidos ficará disponível quando a loja ativar a Shopify. Para consultar um orçamento ou solicitar atendimento, fale com nossa equipe."}
        </p>
        <a href={connected ? `https://${shopDomain()}/account` : "/contato"} className="btn">
          {connected ? "Acessar minha conta" : "Solicitar atendimento"}
        </a>
        <a href="/produtos" className="text-link">Explorar produtos</a>
      </div>
    </Shell>
  );
}
