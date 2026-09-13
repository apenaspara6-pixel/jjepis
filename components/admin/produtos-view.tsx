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
export function AdminProducts({
  connected,
  found,
  q,
  setQ,
  filter,
  setFilter,
  setEditing,
  setDeleting,
}: {
  connected: boolean;
  found: Product[];
  q: string;
  setQ: (v: string) => void;
  filter: string;
  setFilter: (v: string) => void;
  setEditing: (v: Product) => void;
  setDeleting: (v: Product) => void;
}) {
  return (
    <>
      {connected && (
        <p className="notice">
          A Shopify controla produtos, preços e estoque. Use o painel oficial
          para editar sem duplicar dados.
        </p>
      )}
      <div className="admin-toolbar">
        <div className="searchbar">
          <input
            aria-label="Pesquisar produtos administrativos"
            placeholder="Pesquisar produto, SKU ou categoria…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Search size={18} />
        </div>
        <Choice
          label="Filtrar produtos administrativos"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "Todos os produtos" },
            { value: "active", label: "Ativos" },
            { value: "hidden", label: "Ocultos" },
            { value: "zero", label: "Sem estoque" },
            { value: "low", label: "Estoque baixo (<5)" },
          ]}
        />
      </div>
      <div className="admin-panel table-panel admin-products">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {found.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="admin-product-cell">
                    {p.images[0] ? (
                      <img src={p.images[0]} alt={p.name} />
                    ) : (
                      <span>
                        <ImageIcon size={20} />
                      </span>
                    )}
                    <div>
                      <b>{p.name}</b>
                      <small>
                        {p.sku}
                        {p.demo ? " · Demonstrativo" : ""}
                      </small>
                    </div>
                  </div>
                </TableCell>
                <TableCell data-label="Status">
                  <span className={"status-pill status-" + p.status}>
                    {p.status === "active" ? "Ativo" : "Oculto"}
                  </span>
                </TableCell>
                <TableCell data-label="Preço">{money(p.price)}</TableCell>
                <TableCell data-label="Estoque">
                  <span className={p.stock < 5 ? "stock-warning" : ""}>
                    {p.stock}
                  </span>
                </TableCell>
                <TableCell data-label="Ações">
                  <div className="row-actions">
                    <button
                      aria-label={"Editar " + p.name}
                      onClick={() =>
                        connected
                          ? window.open(
                              "https://admin.shopify.com/",
                              "_blank",
                              "noopener",
                            )
                          : setEditing(p)
                      }
                    >
                      <Pencil size={16} />
                    </button>
                    {!connected && (
                      <>
                        <button
                          aria-label={"Duplicar " + p.name}
                          onClick={() =>
                            setEditing({
                              ...p,
                              id: "",
                              name: p.name + " (cópia)",
                              slug:
                                p.slug + "-copia-" + Date.now().toString(36),
                              sku: p.sku + "-COPIA",
                              status: "hidden",
                              createdAt: Date.now(),
                            })
                          }
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          aria-label={"Excluir " + p.name}
                          onClick={() => setDeleting(p)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {found.length === 0 && (
          <div className="empty-state">
            <p>Nenhum produto encontrado para estes filtros.</p>
          </div>
        )}
      </div>
      <p className="form-note">
        {found.length} {found.length === 1 ? "produto" : "produtos"} · Estoque
        baixo: menos de 5 unidades.
      </p>
    </>
  );
}
