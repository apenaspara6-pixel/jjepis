"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="container section">
      <div className="error-box">
        <h2>Não foi possível carregar esta página.</h2>
        <p>
          Tente novamente em instantes. Seus dados salvos continuam disponíveis.
        </p>
        <button className="btn" onClick={reset}>
          Tentar novamente
        </button>
        <a className="btn btn-outline" href="/">
          Voltar ao início
        </a>
      </div>
    </main>
  );
}
