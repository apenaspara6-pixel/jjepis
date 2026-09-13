import {
  getChatGPTUser,
  chatGPTSignInPath,
  chatGPTSignOutPath,
} from "@/app/chatgpt-auth";
import { Shell } from "@/components/store/chrome";
import { UserRound } from "lucide-react";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Minha conta",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const user = await getChatGPTUser();
  return (
    <Shell>
      <div className="account-page">
        <UserRound size={44} />
        <h1>{user ? "Olá, " + user.displayName : "Minha conta"}</h1>
        <p>
          {user
            ? "Seu acesso foi reconhecido. Quando a Shopify estiver conectada, o acompanhamento de pedidos será feito no ambiente seguro da loja."
            : "Entre com sua conta ChatGPT para acessar sua identificação no site. O acompanhamento de pedidos ficará disponível após conectar a Shopify."}
        </p>
        {user ? (
          <>
            <a href="/produtos" className="btn">
              Explorar produtos
            </a>
            <a
              href={chatGPTSignOutPath("/")}
              target="_top"
              className="text-link"
            >
              Sair da conta
            </a>
          </>
        ) : (
          <a
            href={chatGPTSignInPath("/minha-conta")}
            target="_top"
            className="btn"
          >
            Entrar com ChatGPT
          </a>
        )}
      </div>
    </Shell>
  );
}
