"use client";
import { AdminShopify } from "./shopify-view";
import { AdminSettings } from "./configuracoes-view";
import { AdminProducts } from "./produtos-view";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Users,
  Ticket,
  ImageIcon,
  Settings,
  Plug,
  ArrowUpRight,
  Plus,
  Search,
  Copy,
  Pencil,
  Trash2,
  LogOut,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Choice } from "@/components/store/primitives";
import { api } from "@/components/store/context";
import {
  type Product,
  type Category,
  type Settings as CompanySettings,
  money,
  normalize,
  slugify,
} from "@/lib/catalog";
import { AdminProductForm, ImageUpload } from "./product-form";
import { toast } from "sonner";
const sections = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["produtos", "Produtos", Package],
  ["categorias", "Categorias", Tags],
  ["pedidos", "Pedidos", ShoppingBag],
  ["clientes", "Clientes", Users],
  ["cupons", "Cupons", Ticket],
  ["imagens", "Imagens", ImageIcon],
  ["mensagens", "Mensagens", MessageSquare],
  ["configuracoes", "Configurações", Settings],
  ["integracoes", "Integrações", Plug],
  ["shopify", "Shopify", ShoppingBag],
] as const;
export function AdminApp({
  section,
  initialProducts,
  initialCategories,
  initialSettings,
  email,
  connected,
}: {
  section: string;
  initialProducts: Product[];
  initialCategories: Category[];
  initialSettings: CompanySettings;
  email: string;
  connected: boolean;
}) {
  const [products, setProducts] = useState(initialProducts),
    [categories, setCategories] = useState(initialCategories),
    [settings, setSettings] = useState(initialSettings),
    [editing, setEditing] = useState<Product | null | undefined>(undefined),
    [q, setQ] = useState(""),
    [filter, setFilter] = useState("all"),
    [deleting, setDeleting] = useState<Product | null>(null),
    [category, setCategory] = useState<Category | null>(null),
    [remote, setRemote] = useState<any>(null),
    [remoteError, setRemoteError] = useState(""),
    [busy, setBusy] = useState(false),
    [domain, setDomain] = useState(""),
    [images, setImages] = useState<any[]>([]);
  async function refresh() {
    try {
      setProducts(await api("/api/admin/products"));
    } catch (e) {
      toast.error((e as Error).message);
    }
  }
  useEffect(() => {
    const map: Record<string, string> = {
      dashboard: "dashboard",
      pedidos: "orders",
      clientes: "customers",
      cupons: "coupons",
      mensagens: "messages",
      shopify: "status",
      integracoes: "status",
    };
    if (map[section])
      api("/api/admin/" + map[section])
        .then((j) => {
          setRemote(j);
          if (j.domain) setDomain(j.domain);
        })
        .catch((e) => setRemoteError(e.message));
    if (section === "imagens")
      api("/api/admin/images")
        .then(setImages)
        .catch((e) => setRemoteError(e.message));
  }, [section]);
  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await api("/api/admin/products", { id: deleting.id }, "DELETE");
      setDeleting(null);
      await refresh();
      toast.success("Produto excluído.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const found = products.filter(
    (p) =>
      normalize([p.name, p.sku, p.category, ...p.tags].join(" ")).includes(
        normalize(q),
      ) &&
      (filter === "all" ||
        (filter === "low" && p.stock > 0 && p.stock < 5) ||
        (filter === "zero" && p.stock === 0) ||
        filter === p.status),
  );
  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/admin/settings", settings);
      toast.success(
        "Configurações salvas. Reabra a loja para ver as alterações.",
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const settingsField = (key: keyof CompanySettings, label: string) => (
    <label key={key}>
      {label}
      <input
        value={settings[key]}
        onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
      />
    </label>
  );
  async function saveCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!category) return;
    setBusy(true);
    try {
      await api("/api/admin/categories", category);
      setCategories(await api("/api/admin/categories"));
      setCategory(null);
      toast.success("Categoria salva.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const paid = (remote?.items || []).filter(
    (o: any) =>
      o.displayFinancialStatus === "PAID" &&
      o.totalPriceSet?.shopMoney?.currencyCode === "BRL",
  );
  const total = paid.reduce(
    (s: number, o: any) => s + Number(o.totalPriceSet?.shopMoney?.amount || 0),
    0,
  );
  return (
    <SidebarProvider>
      <Sidebar className="admin-sidebar">
        <SidebarHeader>
          <a className="admin-brand" href="/admin">
            <span>JJ</span>
            <b>
              {settings.name}
              <small>PAINEL ADMINISTRATIVO</small>
            </b>
          </a>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {sections.map(([id, label, Icon]) => (
              <SidebarMenuItem key={id}>
                <SidebarMenuButton asChild isActive={section === id}>
                  <a href={"/admin/" + id}>
                    <Icon size={19} />
                    {label}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <a href="/" className="admin-view-store">
            Ver loja <ArrowUpRight size={17} />
          </a>
          <p className="admin-user">{email}</p>
          <a
            href="/signout-with-chatgpt?return_to=%2Fadmin"
            target="_top"
            className="admin-signout"
          >
            <LogOut size={16} />
            Sair
          </a>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="admin-main">
        <header className="admin-top">
          <SidebarTrigger />
          <span>
            JJ Epi's <span className="muted">/ Administração</span>
          </span>
          <span
            className={"connection-badge " + (connected ? "connected" : "")}
          >
            {connected ? "Shopify configurada" : "Shopify desconectada"}
          </span>
        </header>
        <div className="admin-content">
          {editing !== undefined ? (
            <AdminProductForm
              initial={editing || undefined}
              products={products}
              categories={categories}
              onCancel={() => setEditing(undefined)}
              onSaved={() => {
                setEditing(undefined);
                refresh();
              }}
            />
          ) : (
            <>
              <div className="admin-title">
                <div>
                  <span className="eyebrow accent">
                    SUA OPERAÇÃO, SOB CONTROLE
                  </span>
                  <h1>
                    {sections.find((s) => s[0] === section)?.[1] || "Dashboard"}
                  </h1>
                </div>
                {section === "produtos" && (
                  <Button
                    className="btn"
                    onClick={() =>
                      connected
                        ? window.open(
                            "https://admin.shopify.com/",
                            "_blank",
                            "noopener",
                          )
                        : setEditing(null)
                    }
                  >
                    <Plus size={17} />
                    {connected ? "Gerenciar na Shopify" : "Adicionar produto"}
                  </Button>
                )}
              </div>
              {section === "dashboard" && (
                <>
                  <div className="admin-stats">
                    {[
                      ["Total de produtos", products.length],
                      [
                        "Produtos ativos",
                        products.filter((p) => p.status === "active").length,
                      ],
                      [
                        "Sem estoque",
                        products.filter((p) => p.stock === 0).length,
                      ],
                      [
                        "Estoque baixo",
                        products.filter((p) => p.stock > 0 && p.stock < 5)
                          .length,
                      ],
                    ].map(([t, n]) => (
                      <div key={t}>
                        <Package size={19} />
                        <p>{t}</p>
                        <strong>{n}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="admin-panel admin-welcome">
                    <div>
                      <h2>Pronta para a próxima operação.</h2>
                      <p>
                        Cadastre seus produtos, organize suas imagens e mantenha
                        preços e estoque atualizados.
                      </p>
                    </div>
                    <a className="btn btn-outline" href="/admin/produtos">
                      Gerenciar catálogo <ArrowUpRight size={17} />
                    </a>
                  </div>
                  <div className="admin-two-col">
                    <section className="admin-panel">
                      <h2>Vendas e faturamento</h2>
                      <strong className="big-stat">
                        {remote?.connected ? money(total) : "—"}
                      </strong>
                      <p>
                        {remote?.connected
                          ? paid.length +
                            " pedidos pagos em reais. " +
                            remote.message
                          : "Os indicadores serão preenchidos com pedidos reais da Shopify."}
                      </p>
                      <a href="/admin/shopify" className="text-link">
                        Configurar integração <ArrowUpRight size={16} />
                      </a>
                    </section>
                    <section className="admin-panel">
                      <h2>Produtos mais vendidos</h2>
                      {remote?.connected ? (
                        <BestSellers orders={paid} />
                      ) : (
                        <div className="admin-empty">
                          <ShoppingBag size={30} />
                          <p>
                            O histórico de vendas aparecerá após conectar a
                            loja.
                          </p>
                        </div>
                      )}
                    </section>
                  </div>
                  <section className="admin-panel">
                    <h2>Pedidos recentes</h2>
                    <RemoteTable data={remote} kind="pedidos" />
                  </section>
                  <a
                    className="admin-panel admin-welcome"
                    href="/admin/mensagens"
                  >
                    <div>
                      <h2>Orçamentos e mensagens</h2>
                      <p>Acompanhe as solicitações recebidas pelo site.</p>
                    </div>
                    <MessageSquare size={24} />
                  </a>
                </>
              )}
              {section === "produtos" && (
                <AdminProducts
                  connected={connected}
                  found={found}
                  q={q}
                  setQ={setQ}
                  filter={filter}
                  setFilter={setFilter}
                  setEditing={setEditing}
                  setDeleting={setDeleting}
                />
              )}
              {section === "categorias" && (
                <>
                  <Button
                    className="btn"
                    onClick={() =>
                      setCategory({
                        id: "",
                        name: "",
                        description: "",
                        image: "",
                      })
                    }
                  >
                    <Plus size={16} />
                    Nova categoria
                  </Button>
                  <div className="admin-category-grid">
                    {categories.map((c) => (
                      <button
                        className="admin-panel"
                        key={c.id}
                        onClick={() => setCategory(c)}
                      >
                        {c.image ? (
                          <img src={c.image} alt={c.name} />
                        ) : (
                          <Tags size={32} />
                        )}
                        <h2>{c.name}</h2>
                        <p>{c.description}</p>
                        <span className="text-link">
                          Editar categoria <Pencil size={14} />
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {["pedidos", "clientes", "cupons"].includes(section) && (
                <section className="admin-panel">
                  <h2>{sections.find((s) => s[0] === section)?.[1]}</h2>
                  <RemoteTable data={remote} kind={section} />
                  <a
                    className="btn btn-outline"
                    href={
                      connected
                        ? "https://admin.shopify.com/"
                        : "/admin/shopify"
                    }
                  >
                    {connected ? "Gerenciar na Shopify" : "Conectar Shopify"}
                    <ArrowUpRight size={16} />
                  </a>
                </section>
              )}
              {section === "mensagens" && (
                <section className="admin-panel">
                  <h2>Solicitações recebidas</h2>
                  {Array.isArray(remote) ? (
                    remote.length ? (
                      remote.map((m: any) => (
                        <article className="message-card" key={m.id}>
                          <span className="eyebrow">
                            {new Date(m.createdAt).toLocaleString("pt-BR")}
                          </span>
                          <h3>{m.subject}</h3>
                          <p>{m.message}</p>
                          <dl>
                            <dt>Contato</dt>
                            <dd>
                              {m.name} · {m.company}
                              <br />
                              {m.email}
                              <br />
                              {m.phone}
                            </dd>
                          </dl>
                          {m.cart?.length > 0 && (
                            <p>
                              Itens solicitados:{" "}
                              {m.cart
                                .map(
                                  (l: any) =>
                                    l.quantity + " × " + l.product.name,
                                )
                                .join("; ")}
                            </p>
                          )}
                        </article>
                      ))
                    ) : (
                      <div className="admin-empty">
                        <MessageSquare size={32} />
                        <p>
                          Nenhuma solicitação recebida. As mensagens enviadas
                          pelo formulário aparecerão aqui.
                        </p>
                      </div>
                    )
                  ) : (
                    <p>Carregando mensagens…</p>
                  )}
                </section>
              )}
              {section === "imagens" && (
                <section className="admin-panel">
                  <h2>Biblioteca de imagens</h2>
                  <p>
                    Envie fotos aqui ou diretamente no cadastro do produto. Para
                    associar uma imagem já enviada, copie o endereço e use o
                    cadastro correspondente.
                  </p>
                  <ImageUpload
                    images={[]}
                    onChange={() => api("/api/admin/images").then(setImages)}
                  />
                  <div className="library-grid">
                    {images.map((im) => (
                      <div key={im.id}>
                        <img
                          src={"/api/media/" + im.id}
                          alt={im.name}
                          loading="lazy"
                        />
                        <p>{im.name}</p>
                        <button
                          className="text-link"
                          onClick={() =>
                            navigator.clipboard
                              .writeText("/api/media/" + im.id)
                              .then(() => toast.success("Endereço copiado."))
                              .catch(() =>
                                toast.error("Não foi possível copiar."),
                              )
                          }
                        >
                          Copiar endereço
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {section === "configuracoes" && (
                <AdminSettings
                  saveSettings={saveSettings}
                  settingsField={settingsField}
                  settings={settings}
                  setSettings={setSettings}
                  busy={busy}
                />
              )}
              {section === "integracoes" && (
                <>
                  <section className="admin-panel admin-welcome">
                    <div>
                      <h2>Shopify</h2>
                      <p>
                        {remote?.connected
                          ? "Conectada e verificada."
                          : "Conecte seu catálogo, estoque e checkout."}
                      </p>
                    </div>
                    <a href="/admin/shopify" className="btn">
                      Configurar Shopify <ArrowUpRight size={16} />
                    </a>
                  </section>
                  <form onSubmit={saveSettings}>
                    <section className="admin-panel">
                      <h2>Análise e marketing</h2>
                      <p>
                        As ferramentas de rastreamento são carregadas somente
                        após o consentimento do visitante. Se houver GTM,
                        configure os demais rastreadores nele para evitar
                        duplicação.
                      </p>
                      <div className="form-grid">
                        {settingsField("ga", "Google Analytics (G-XXXXXXXX)")}
                        {settingsField(
                          "gtm",
                          "Google Tag Manager (GTM-XXXXXXX)",
                        )}
                        {settingsField("pixel", "Meta Pixel (ID numérico)")}
                        {settingsField(
                          "marketing",
                          "E-mail marketing — provedor planejado",
                        )}
                      </div>
                      <p>
                        E-mail marketing: estrutura reservada; nenhum contato é
                        inscrito automaticamente.
                      </p>
                      <Button type="submit" className="btn" disabled={busy}>
                        Salvar integrações
                      </Button>
                    </section>
                  </form>
                </>
              )}
              {section === "shopify" && (
                <AdminShopify
                  remote={remote}
                  domain={domain}
                  setDomain={setDomain}
                  busy={busy}
                  setBusy={setBusy}
                  setRemote={setRemote}
                />
              )}
              {remoteError && <div className="notice">{remoteError}</div>}
            </>
          )}
        </div>
      </SidebarInset>
      <AlertDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Excluir este produto?</AlertDialogTitle>
          <AlertDialogDescription>
            {deleting?.name} será removido do catálogo. Você também pode
            cancelar e alterar seu status para oculto.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                remove();
              }}
            >
              Excluir produto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={!!category} onOpenChange={(v) => !v && setCategory(null)}>
        <DialogContent className="category-dialog">
          <DialogTitle>Cadastro de categoria</DialogTitle>
          <DialogDescription>
            Nome, descrição e fotografia usados no catálogo.
          </DialogDescription>
          {category && (
            <form onSubmit={saveCategory}>
              <label>
                Nome
                <input
                  required
                  value={category.name}
                  onChange={(e) =>
                    setCategory({
                      ...category,
                      name: e.target.value,
                      id: initialCategories.some((c) => c.id === category.id)
                        ? category.id
                        : slugify(e.target.value),
                    })
                  }
                />
              </label>
              <label>
                Identificador
                <input
                  required
                  value={category.id}
                  readOnly={categories.some((c) => c.id === category.id)}
                  onChange={(e) =>
                    setCategory({ ...category, id: slugify(e.target.value) })
                  }
                />
              </label>
              <label>
                Descrição
                <input
                  value={category.description}
                  onChange={(e) =>
                    setCategory({ ...category, description: e.target.value })
                  }
                />
              </label>
              <ImageUpload
                max={1}
                images={category.image ? [category.image] : []}
                onChange={(v) =>
                  setCategory({ ...category, image: v[0] || "" })
                }
              />
              <Button className="btn" disabled={busy}>
                Salvar categoria
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
function RemoteTable({ data, kind }: { data: any; kind: string }) {
  if (!data) return <p>Carregando…</p>;
  if (!data.connected)
    return (
      <div className="admin-empty">
        <ShoppingBag size={32} />
        <p>
          {data.message ||
            "Conecte a Shopify para consultar informações reais."}
        </p>
      </div>
    );
  if (!data.items?.length)
    return (
      <div className="admin-empty">
        <p>Nenhum registro disponível para esta loja.</p>
      </div>
    );
  return (
    <div className="remote-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              {kind === "clientes"
                ? "Cliente"
                : kind === "cupons"
                  ? "Cupom"
                  : "Pedido"}
            </TableHead>
            <TableHead>Informação</TableHead>
            <TableHead>Status / valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items.map((x: any) => (
            <TableRow key={x.id}>
              <TableCell>
                {x.name || x.displayName || x.discount?.title}
              </TableCell>
              <TableCell>
                {x.email ||
                  x.createdAt?.slice(0, 10) ||
                  x.discount?.codes?.nodes?.[0]?.code ||
                  "—"}
              </TableCell>
              <TableCell>
                {x.totalPriceSet
                  ? new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: x.totalPriceSet.shopMoney.currencyCode,
                    }).format(Number(x.totalPriceSet.shopMoney.amount))
                  : (x.numberOfOrders ?? x.discount?.status ?? "—")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
function BestSellers({ orders }: { orders: any[] }) {
  const m: Record<string, number> = {};
  orders.forEach((o) =>
    o.lineItems?.nodes?.forEach(
      (l: any) => (m[l.title] = (m[l.title] || 0) + l.quantity),
    ),
  );
  const items = Object.entries(m)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  return items.length ? (
    <ul className="bestsellers">
      {items.map(([n, q]) => (
        <li key={n}>
          <span>{n}</span>
          <b>{q} un.</b>
        </li>
      ))}
    </ul>
  ) : (
    <p>Aguardando pedidos pagos.</p>
  );
}
