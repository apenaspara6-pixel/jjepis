"use client";
import { useState } from "react";
import { ShieldCheck, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
export function AdminLogin() {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const data = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.get("username"),
          password: data.get("password"),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw Error(result.error || "Não foi possível entrar.");
      window.location.assign("/admin");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
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
        <p>Entre com seu acesso administrativo para gerenciar a loja.</p>
        <form onSubmit={submit}>
          <label htmlFor="admin-username">Acesso</label>
          <input
            id="admin-username"
            name="username"
            autoComplete="username"
            required
            maxLength={64}
            autoCapitalize="none"
            spellCheck={false}
            disabled={busy}
          />
          <label htmlFor="admin-password">Senha</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={256}
            disabled={busy}
          />
          {error && (
            <p role="alert" className="admin-login-error">
              {error}
            </p>
          )}
          <Button type="submit" className="btn" disabled={busy}>
            <LockKeyhole size={17} />
            {busy ? "Entrando…" : "ENTRAR NO PAINEL"}
          </Button>
        </form>
        <a className="text-link" href="/">
          Voltar à loja
        </a>
      </div>
    </main>
  );
}
