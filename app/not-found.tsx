import { Shell } from "@/components/store/chrome";
export default function NotFound() {
  return (
    <Shell>
      <div className="empty-state">
        <span className="eyebrow accent">PÁGINA NÃO ENCONTRADA</span>
        <h1>Vamos encontrar o caminho certo.</h1>
        <p>Este produto ou endereço não está disponível.</p>
        <a className="btn" href="/produtos">
          Explorar catálogo
        </a>
      </div>
    </Shell>
  );
}
