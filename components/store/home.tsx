"use client";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Truck,
  Headphones,
  PackageCheck,
  LockKeyhole,
  Check,
  MoveDown,
  MessageCircle,
} from "lucide-react";
import { Shell } from "./chrome";
import { ProductGrid, CategoryCard, SectionHeading } from "./primitives";
import { type Product, type Settings, type Category } from "@/lib/catalog";
import { useStore } from "./context";
export function Home({
  products,
  settings: s,
  categories,
}: {
  products: Product[];
  settings: Settings;
  categories: Category[];
}) {
  const { whatsapp } = useStore();
  return (
    <Shell>
      <section className="hero">
        <img
          src={s.hero}
          alt="Caminhão-tanque em um terminal industrial ao anoitecer"
          className="hero-photo"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span />
              PRONTOS PARA A SUA OPERAÇÃO
            </div>
            <h1>
              Segurança que
              <br />
              acompanha sua carga
              <br />
              em cada <em>quilômetro.</em>
            </h1>
            <p>
              Painéis de Segurança, Rótulos de Risco, conexões e equipamentos
              para transporte de combustíveis e cargas perigosas.
            </p>
            <div className="hero-buttons">
              <a className="btn" href="/produtos">
                VER PRODUTOS <ArrowUpRight size={19} />
              </a>
              <a
                className="btn btn-outline-light"
                href="/contato?assunto=Orçamento"
              >
                SOLICITAR ORÇAMENTO <ArrowRight size={18} />
              </a>
            </div>
            <div className="hero-assurances">
              <span>
                <Check />
                Produtos profissionais
              </span>
              <span>
                <Check />
                Atendimento especializado
              </span>
              <span>
                <Check />
                Envio nacional
              </span>
            </div>
          </div>
          <div className="hero-caption">
            <span>SEGURANÇA EM MOVIMENTO</span>
            <span>Transporte. Indústria. Confiança.</span>
          </div>
          <a
            href="#categorias"
            className="hero-scroll"
            aria-label="Explorar categorias"
          >
            <MoveDown size={20} />
          </a>
        </div>
      </section>
      <div className="trust-strip">
        <div className="container">
          {[
            [
              ShieldCheck,
              "Qualidade profissional",
              "Materiais para sua rotina",
            ],
            [Truck, "Do pedido à sua operação", "Consulte prazos de entrega"],
            [
              Headphones,
              "Atendimento especializado",
              "A escolha certa para sua carga",
            ],
            [LockKeyhole, "Compra segura", "Sua tranquilidade vem primeiro"],
          ].map(([Icon, t, d]: any) => (
            <div key={t}>
              <Icon size={29} strokeWidth={1.4} />
              <p>
                <b>{t}</b>
                <span>{d}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
      <section className="section container" id="categorias">
        <SectionHeading
          kicker="ENCONTRE O QUE SUA OPERAÇÃO PRECISA"
          title="Especialistas em cada detalhe."
          href="/produtos"
          link="Explorar catálogo"
        />
        <div className="category-grid">
          {categories.map((c, i) => (
            <CategoryCard key={c.id} category={c} index={i} />
          ))}
        </div>
      </section>
      <section className="section gray-section">
        <div className="container">
          <SectionHeading
            kicker="SELEÇÃO JJ EPI'S"
            title="Essenciais para seguir em segurança."
            href="/produtos"
          />
          {products.some((p) => p.demo) && (
            <p className="demo-caption">
              Catálogo demonstrativo · Fotografias, preços e disponibilidade
              sujeitos à confirmação.
            </p>
          )}
          <ProductGrid
            products={products.filter((p) => p.featured).slice(0, 8)}
            swipe
          />
        </div>
      </section>
      <section className="institutional">
        <img
          src={s.secondaryBanner || s.hero}
          alt="Caminhão-tanque em operação industrial"
          loading="lazy"
        />
        <div className="institutional-shade" />
        <div className="container institutional-inner">
          <span className="eyebrow">PARA QUEM LEVA SEGURANÇA A SÉRIO</span>
          <h2>
            Equipamentos preparados
            <br />
            para quem trabalha
            <br />
            com responsabilidade.
          </h2>
          <p>
            Produtos para profissionais e empresas que trabalham diariamente com
            transporte, abastecimento, logística e segurança de cargas
            perigosas.
          </p>
          <a href="/sobre" className="btn btn-white">
            CONHEÇA NOSSA EMPRESA <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <section className="section container">
        <SectionHeading
          kicker="NOSSO COMPROMISSO COM A SUA OPERAÇÃO"
          title="Confiança para ir mais longe."
        />
        <div className="benefit-grid">
          {[
            [
              PackageCheck,
              "Produtos selecionados",
              "Uma seleção voltada às necessidades do transporte e da indústria.",
            ],
            [
              Truck,
              "Envio ágil",
              "Consulte as opções de entrega para planejar sua reposição.",
            ],
            [
              ShieldCheck,
              "Qualidade profissional",
              "Atenção aos materiais, à aplicação e à rotina de trabalho.",
            ],
            [
              Headphones,
              "Atendimento próximo",
              "Conte com orientação para encontrar o produto adequado.",
            ],
          ].map(([Icon, t, d]: any) => (
            <div key={t} className="reveal">
              <Icon size={31} strokeWidth={1.4} />
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section gray-section">
        <div className="container specialty">
          <div className="specialty-intro reveal">
            <span className="eyebrow accent">IDENTIFICAÇÃO VEICULAR</span>
            <h2>
              A segurança começa
              <br />
              pela identificação.
            </h2>
            <p>
              Encontre Painéis de Segurança para identificação de veículos
              destinados ao transporte de produtos perigosos.
            </p>
            <a href="/categoria/paineis-de-seguranca" className="text-link">
              VER TODOS OS PAINÉIS <ArrowUpRight size={18} />
            </a>
          </div>
          <ProductGrid
            products={products
              .filter((p) => p.category === "paineis-de-seguranca")
              .slice(0, 2)}
          />
        </div>
      </section>
      <section className="section container">
        <SectionHeading
          kicker="INFORMAÇÃO CLARA. OPERAÇÃO SEGURA."
          title="Rótulos de Risco."
          href="/categoria/rotulos-de-risco"
          link="Ver todos os rótulos"
        />
        <div className="chips">
          {["2", "3", "8"].map((c) => (
            <a href={"/categoria/rotulos-de-risco?classe=" + c} key={c}>
              Classe {c} <ArrowUpRight size={14} />
            </a>
          ))}
        </div>
        <ProductGrid
          products={products
            .filter((p) => p.category === "rotulos-de-risco")
            .slice(0, 4)}
          swipe
        />
      </section>
      <section className="section gray-section">
        <div className="container">
          <SectionHeading
            kicker="CADA COMPONENTE IMPORTA"
            title="Complete sua operação."
            href="/produtos?grupo=acessorios"
            link="Ver conexões e acessórios"
          />
          <ProductGrid
            products={products
              .filter(
                (p) =>
                  !["paineis-de-seguranca", "rotulos-de-risco"].includes(
                    p.category,
                  ),
              )
              .slice(0, 4)}
            swipe
          />
        </div>
      </section>
      <section className="fleet-cta">
        <div className="container">
          <div>
            <span className="eyebrow">ATENDIMENTO EMPRESARIAL</span>
            <h2>
              Precisa equipar
              <br />
              uma frota inteira?
            </h2>
            <p>
              Consulte condições para compras em quantidade, reposição de
              equipamentos e atendimento para sua empresa.
            </p>
          </div>
          <div className="fleet-actions">
            <a
              href="/contato?assunto=Orçamento para frota"
              className="btn btn-dark"
            >
              SOLICITAR ORÇAMENTO <ArrowUpRight size={19} />
            </a>
            <a href={whatsapp()} className="text-link">
              <MessageCircle size={19} />
              Falar com um especialista
            </a>
          </div>
        </div>
      </section>
    </Shell>
  );
}
