"use client";
import { useEffect, useState } from "react";
import {
  Menu,
  Search,
  UserRound,
  ShoppingBag,
  ArrowUpRight,
  Truck,
  ShieldCheck,
  Headphones,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useStore } from "./context";
const links = [
  ["Início", "/"],
  ["Produtos", "/produtos"],
  ["Painéis de Segurança", "/categoria/paineis-de-seguranca"],
  ["Rótulos de Risco", "/categoria/rotulos-de-risco"],
  ["Conexões", "/categoria/conexoes"],
  ["Equipamentos de Segurança", "/categoria/protecao"],
  ["Sobre Nós", "/sobre"],
  ["Contato", "/contato"],
];
export function Logo() {
  const { settings: s } = useStore();
  return (
    <a className="logo" href="/" aria-label={s.name + " — Início"}>
      {s.logo ? (
        <img src={s.logo} alt={s.name} />
      ) : (
        <>
          <span className="logo-symbol">
            JJ<span>▰</span>
          </span>
          <span className="logo-word">
            {s.name}
            <small>{s.tagline}</small>
          </span>
        </>
      )}
    </a>
  );
}
export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/produtos" className="searchbar" role="search">
      <input
        name="q"
        aria-label="Buscar produtos por nome, categoria ou código"
        placeholder="O que você precisa para sua operação?"
        defaultValue={defaultValue}
      />
      <button aria-label="Pesquisar produtos">
        <Search size={20} />
      </button>
    </form>
  );
}
export function Header() {
  const { lines, openCart, whatsapp } = useStore();
  const [menu, setMenu] = useState(false),
    [search, setSearch] = useState(false),
    [small, setSmall] = useState(false);
  useEffect(() => {
    const f = () => setSmall(scrollY > 40);
    f();
    addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, []);
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <div className="topbar">
        <div className="container">
          <span>
            <Truck size={14} />
            Envio para todo o Brasil
          </span>
          <span>Segurança para quem move o Brasil.</span>
          <a href="/contato">
            Atendimento especializado <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
      <header className={"site-header " + (small ? "compact" : "")}>
        <div className="container header-main">
          <button
            className="icon-btn mobile-only"
            aria-label="Abrir menu"
            onClick={() => setMenu(true)}
          >
            <Menu />
          </button>
          <Logo />
          <div className="desktop-search">
            <SearchBar />
          </div>
          <div className="header-actions">
            <button
              className="icon-btn mobile-only"
              aria-label="Abrir pesquisa"
              onClick={() => setSearch(!search)}
            >
              <Search />
            </button>
            <a href={whatsapp()} className="header-contact">
              <Headphones size={24} />
              <span>
                Precisa de ajuda?<b>Fale com a gente</b>
              </span>
            </a>
            <a
              className="icon-btn account-link"
              href="/minha-conta"
              aria-label="Minha conta"
            >
              <UserRound />
            </a>
            <button
              className="icon-btn cart-icon"
              aria-label="Abrir carrinho"
              onClick={openCart}
            >
              <ShoppingBag />
              <span>{lines.reduce((s, l) => s + l.quantity, 0)}</span>
            </button>
          </div>
        </div>
        {search && (
          <div className="mobile-search container">
            <SearchBar />
          </div>
        )}
        <nav className="nav container" aria-label="Menu principal">
          {links.map(([label, href], i) => (
            <a className={i === 1 ? "nav-products" : ""} key={href} href={href}>
              {i === 1 && <Menu size={17} />} {label}
              {i === 1 && <ChevronDown size={14} />}
            </a>
          ))}
        </nav>
      </header>
      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="left" className="mobile-menu">
          <SheetHeader>
            <SheetTitle>
              <Logo />
            </SheetTitle>
            <SheetDescription>Segurança em cada quilômetro.</SheetDescription>
          </SheetHeader>
          <SearchBar />
          <nav>
            {links.map(([label, href]) => (
              <a href={href} key={href} onClick={() => setMenu(false)}>
                {label}
                <ArrowUpRight size={16} />
              </a>
            ))}
          </nav>
          <a href="/minha-conta">Minha conta</a>
        </SheetContent>
      </Sheet>
    </>
  );
}
export function Footer() {
  const { settings: s, whatsapp } = useStore();
  return (
    <>
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <Logo />
            <p>
              Segurança, sinalização e acessórios para quem transporta
              responsabilidade.
            </p>
            <span className="footer-secure">
              <ShieldCheck size={20} />
              Sua operação em boas mãos.
            </span>
          </div>
          <div>
            <h3>Explore</h3>
            {links
              .slice(1, 4)
              .concat([links[6], links[7]])
              .map(([t, h]) => (
                <a key={h} href={h}>
                  {t}
                </a>
              ))}
          </div>
          <div>
            <h3>Informações</h3>
            <a href="/politica-de-privacidade">Política de Privacidade</a>
            <a href="/termos-de-uso">Termos de Uso</a>
            <a href="/trocas-e-devolucoes">Trocas e Devoluções</a>
            <a href="/minha-conta">Minha conta</a>
            <a href="/admin">Área administrativa</a>
          </div>
          <div>
            <h3>Vamos conversar</h3>
            <a href={whatsapp()}>
              <MessageCircle size={16} />
              {s.whatsapp || "Solicitar atendimento"}
            </a>
            {s.phone && <a href={"tel:" + s.phone}>{s.phone}</a>}
            {s.email && <a href={"mailto:" + s.email}>{s.email}</a>}
            {s.address && <p>{s.address}</p>}
            {!s.phone && !s.email && !s.address && (
              <p>
                Os canais comerciais serão divulgados em breve. Use nosso
                formulário de contato.
              </p>
            )}
            <div className="socials">
              {s.instagram && <a href={s.instagram}>Instagram ↗</a>}
              {s.facebook && <a href={s.facebook}>Facebook ↗</a>}
            </div>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} {s.name}. Todos os direitos reservados.
          </span>
          <span>
            <LockIcon />
            Compra segura{" "}
            <span className="payments">PIX · VISA · mastercard</span>
            <small>Conforme disponibilidade no checkout.</small>
          </span>
        </div>
      </footer>
      <a
        href={whatsapp()}
        className="floating-whatsapp"
        aria-label="Falar pelo WhatsApp ou solicitar contato"
      >
        <MessageCircle size={25} />
      </a>
    </>
  );
}
function LockIcon() {
  return <ShieldCheck size={17} />;
}
export function Reveal() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("will-reveal");
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return null;
}
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="conteudo">{children}</main>
      <Footer />
      <Reveal />
    </>
  );
}
