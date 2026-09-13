import { notFound } from "next/navigation";
import { Shell } from "@/components/store/chrome";
import { getSettings } from "@/lib/repository";
const pages: Record<
  string,
  { title: string; field: "privacy" | "terms" | "returns"; text: string }
> = {
  "politica-de-privacidade": {
    title: "Política de Privacidade",
    field: "privacy",
    text: "Este site recebe os dados que você fornece no formulário de contato: nome, empresa, telefone, e-mail, assunto e mensagem. Os itens do carrinho podem acompanhar sua solicitação para facilitar o orçamento.\n\nEssas informações ficam armazenadas para atendimento pela equipe responsável. O carrinho usa um cookie necessário para identificar os itens selecionados neste navegador.\n\nFerramentas opcionais de análise, quando configuradas, são carregadas somente após sua escolha de consentimento. Você pode apagar os dados do site no navegador para refazer essa escolha.\n\nPara solicitar informações sobre seus dados, utilize o formulário de contato. Os dados cadastrais da empresa e as condições definitivas de tratamento serão complementados antes da abertura comercial.",
  },
  "termos-de-uso": {
    title: "Termos de Uso",
    field: "terms",
    text: "O catálogo encontra-se em preparação. Produtos marcados como demonstrativos têm nomes e preços de referência e não constituem oferta comercial confirmada. Fotografias, características, disponibilidade e condições devem ser confirmadas com a equipe.\n\nO carrinho organiza os itens de interesse. O pagamento será disponibilizado por meio da Shopify após a conexão da loja e a validação do catálogo. Não são recebidos pagamentos neste ambiente demonstrativo.\n\nA seleção dos equipamentos depende da aplicação, da compatibilidade e das exigências da operação. Solicite as especificações do modelo antes da compra.\n\nEstes textos são provisórios e devem ser revisados pela empresa antes do início das vendas.",
  },
  "trocas-e-devolucoes": {
    title: "Trocas e Devoluções",
    field: "returns",
    text: "A política comercial de trocas e devoluções está em preparação e será disponibilizada antes do início das vendas.\n\nPara consultar uma situação específica, envie uma mensagem com o nome do produto, identificação da solicitação e descrição do atendimento necessário. Nunca envie dados completos de cartão pelo formulário.\n\nCondições, prazos e instruções serão confirmados pela equipe, observados os direitos aplicáveis ao consumidor. O catálogo demonstrativo não recebe pagamentos ou conclui pedidos.",
  },
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ info: string }>;
}) {
  const p = pages[(await params).info];
  return {
    title: p?.title || "Página",
    robots: { index: false, follow: true },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ info: string }>;
}) {
  const p = pages[(await params).info];
  if (!p) notFound();
  const s = await getSettings();
  return (
    <Shell>
      <div className="container prose-page">
        <div className="breadcrumb">
          <a href="/">Início</a> / {p.title}
        </div>
        <h1>{p.title}</h1>
        {!s[p.field] && (
          <div className="notice">
            Informações provisórias · em preparação para a abertura da loja.
          </div>
        )}
        <p>{s[p.field] || p.text}</p>
        <a className="btn btn-outline" href="/contato">
          Entrar em contato
        </a>
      </div>
    </Shell>
  );
}
