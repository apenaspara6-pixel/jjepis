"use client";
import {
  ImageIcon,
  Plus,
  Pencil,
  Copy,
  Trash2,
  Search,
  ShoppingBag,
  ArrowUpRight,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Choice } from "@/components/store/primitives";
import { ImageUpload } from "./product-form";
import { api } from "@/components/store/context";
import {
  type Product,
  type Settings as CompanySettings,
  money,
} from "@/lib/catalog";
import { toast } from "sonner";
export function AdminShopify({
  remote,
  domain,
  setDomain,
  busy,
  setBusy,
  setRemote,
}: {
  remote: any;
  domain: string;
  setDomain: (s: string) => void;
  busy: boolean;
  setBusy: (b: boolean) => void;
  setRemote: (v: any) => void;
}) {
  return (
    <>
      <section className="admin-panel shopify-card">
        <ShoppingBag size={45} />
        <div>
          <h2>
            {remote?.connected ? "Shopify conectada" : "Shopify desconectada"}
          </h2>
          <p>
            Um único catálogo para produtos, imagens, variantes, preços e
            estoque. Checkout, frete e cupons são processados pela Shopify.
          </p>
        </div>
      </section>
      <section className="admin-panel">
        <h2>Configurações › Integrações › Shopify</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await api("/api/admin/shopify", { domain });
              setRemote(await api("/api/admin/status"));
              toast.success("Shopify conectada e verificada.");
            } catch (e) {
              toast.error((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Domínio da loja
            <input
              required
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="sua-loja.myshopify.com"
            />
          </label>
          <Button type="submit" className="btn" disabled={busy}>
            {busy ? "Verificando…" : "CONECTAR SHOPIFY"}
          </Button>
        </form>
        <div className="integration-steps">
          <h3>Conexão segura</h3>
          <ol>
            <li>
              Cadastre o canal Headless na Shopify e publique os produtos nesse
              canal.
            </li>
            <li>
              Configure <code>SHOPIFY_STORE_DOMAIN</code> e{" "}
              <code>SHOPIFY_STOREFRONT_TOKEN</code> como variáveis do ambiente
              do site.
            </li>
            <li>
              Para consultar pedidos, clientes e cupons, adicione{" "}
              <code>SHOPIFY_ADMIN_TOKEN</code> como segredo, com os escopos de
              leitura necessários.
            </li>
            <li>
              Publique a atualização do ambiente e use o botão acima para
              verificar a conexão.
            </li>
          </ol>
          <p>
            O token administrativo fica exclusivamente no servidor. Quando
            conectada, a Shopify assume os dados comerciais e a edição acontece
            pelo painel oficial.
          </p>
          <a
            href="https://shopify.dev/docs/storefronts/headless"
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            Documentação oficial Shopify <ArrowUpRight size={15} />
          </a>
        </div>
      </section>
    </>
  );
}
