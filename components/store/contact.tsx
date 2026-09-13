"use client";
import { useState } from "react";
import { MessageCircle, CheckCircle, ArrowUpRight } from "lucide-react";
import { Button } from "./primitives";
import { Shell } from "./chrome";
import { api, useStore } from "./context";
import { toast } from "sonner";
export function Contact({ subject }: { subject: string }) {
  const { settings: s, whatsapp, lines } = useStore();
  const [busy, setBusy] = useState(false),
    [reference, setReference] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      const r = await api("/api/contact", Object.fromEntries(f));
      setReference(r.reference);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Shell>
      <div className="container">
        <div className="breadcrumb">
          <a href="/">Início</a> / Contato
        </div>
        <div className="page-top">
          <span className="eyebrow accent">ATENDIMENTO JJ EPI'S</span>
          <h1>Vamos cuidar da sua operação.</h1>
          <p>
            Conte o que você precisa. Encontre produtos, tire dúvidas ou
            solicite um orçamento para sua frota.
          </p>
        </div>
        <div className="contact-layout">
          {reference ? (
            <div className="empty-state">
              <CheckCircle size={44} />
              <h2>Mensagem recebida.</h2>
              <p>
                Sua solicitação foi registrada para nossa equipe. Guarde o
                protocolo: <b>{reference}</b>.
              </p>
              <Button
                className="btn btn-outline"
                onClick={() => setReference("")}
              >
                Enviar outra mensagem
              </Button>
            </div>
          ) : (
            <form className="form-grid" onSubmit={submit}>
              <label>
                Nome
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={120}
                  autoComplete="name"
                />
              </label>
              <label>
                Empresa
                <input
                  name="company"
                  maxLength={160}
                  autoComplete="organization"
                />
              </label>
              <label>
                Telefone
                <input
                  name="phone"
                  type="tel"
                  required
                  minLength={8}
                  maxLength={30}
                  autoComplete="tel"
                />
              </label>
              <label>
                E-mail
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={180}
                  autoComplete="email"
                />
              </label>
              <label className="span-2">
                Assunto
                <input
                  name="subject"
                  required
                  defaultValue={subject}
                  minLength={3}
                  maxLength={180}
                />
              </label>
              <label className="span-2">
                Mensagem
                <textarea
                  name="message"
                  required
                  minLength={10}
                  maxLength={5000}
                  placeholder="Informe os produtos, quantidades e cidade de entrega."
                />
              </label>
              <div style={{ display: "none" }} aria-hidden="true">
                <input name="website" tabIndex={-1} autoComplete="off" />
              </div>
              {lines.length > 0 && (
                <p className="span-2 form-note">
                  Os {lines.length} itens do seu carrinho serão anexados à
                  solicitação.
                </p>
              )}
              <p className="span-2 form-note">
                Usaremos os dados informados para atender à sua solicitação.{" "}
                <a href="/politica-de-privacidade">Política de Privacidade</a>.
              </p>
              <Button className="btn" type="submit" disabled={busy}>
                {busy ? "ENVIANDO…" : "ENVIAR MENSAGEM"}
                <ArrowUpRight size={18} />
              </Button>
            </form>
          )}
          <aside className="contact-aside">
            <MessageCircle size={35} />
            <h2>
              Atendimento próximo.
              <br />
              Soluções para sua frota.
            </h2>
            <p>
              Transportadoras, motoristas, distribuidoras de combustível e
              profissionais da indústria: estamos prontos para entender sua
              necessidade.
            </p>
            {s.phone && <p>Telefone: {s.phone}</p>}
            {s.email && (
              <p>
                <a href={"mailto:" + s.email}>{s.email}</a>
              </p>
            )}
            {s.address && <p>{s.address}</p>}
            {s.whatsapp ? (
              <a className="btn" href={whatsapp()}>
                <MessageCircle size={18} />
                FALAR PELO WHATSAPP
              </a>
            ) : (
              <p className="notice">
                Nosso número de WhatsApp será divulgado em breve. Envie sua
                mensagem pelo formulário.
              </p>
            )}
          </aside>
        </div>
      </div>
    </Shell>
  );
}
