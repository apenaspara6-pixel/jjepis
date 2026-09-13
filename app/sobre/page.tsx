import { Shell } from "@/components/store/chrome";
import { getSettings } from "@/lib/repository";
export const metadata = { title: "Sobre a JJ Epi’s" };
export default async function Page() {
  const s = await getSettings();
  return (
    <Shell>
      <div className="container">
        <div className="breadcrumb">
          <a href="/">Início</a> / Sobre nós
        </div>
        <section className="prose-page">
          <span className="eyebrow accent">QUEM SOMOS</span>
          <h1>
            Segurança para quem
            <br />
            transporta responsabilidade.
          </h1>
          <p>
            A {s.name} é uma empresa especializada em produtos de segurança,
            sinalização e acessórios para o transporte rodoviário de
            combustíveis, produtos químicos e cargas perigosas.
          </p>
          <img
            src={s.secondaryBanner || s.hero}
            alt="Caminhão-tanque em terminal industrial"
            loading="lazy"
          />
          <h2>Uma seleção que acompanha sua rotina.</h2>
          <p>
            Reunimos Painéis de Segurança, Rótulos de Risco, conexões,
            equipamentos de proteção e acessórios para apoiar transportadoras,
            motoristas, distribuidoras e equipes responsáveis pela segurança de
            frotas.
          </p>
          <h2>O produto adequado para cada operação.</h2>
          <p>
            Entender a aplicação faz parte de um bom atendimento. Nosso
            compromisso é oferecer informações claras e ajudar você a selecionar
            os itens de acordo com a necessidade do seu trabalho.
          </p>
          <h2>Vamos conversar sobre sua frota.</h2>
          <p>
            Para compras em quantidade, reposição ou dúvidas sobre um produto,
            envie sua solicitação. Nossa equipe poderá orientar a escolha e
            confirmar condições e disponibilidade.
          </p>
          <a href="/contato" className="btn">
            Fale com nossa equipe
          </a>
        </section>
      </div>
    </Shell>
  );
}
