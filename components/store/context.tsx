"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { Toaster, toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  LockKeyhole,
} from "lucide-react";
import { type Product, type Settings, money, origin } from "@/lib/catalog";
type Line = { product: Product; quantity: number; variantId: string };
type Store = {
  settings: Settings;
  lines: Line[];
  add: (p: Product, n: number, variantId?: string) => Promise<void>;
  openCart: () => void;
  busy: boolean;
  whatsapp: (p?: Product) => string;
};
const Context = createContext<Store>(null as any);
export const useStore = () => useContext(Context);
export async function api(
  path: string,
  body?: unknown,
  method = "POST",
): Promise<any> {
  const r = await fetch(path, {
    method: body === undefined ? "GET" : method,
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const j: any = await r.json();
  if (!r.ok)
    throw Error(j.error || "Não foi possível concluir. Tente novamente.");
  return j;
}
export function StoreProvider({
  settings,
  children,
}: {
  settings: Settings;
  children: ReactNode;
}) {
  const [lines, setLines] = useState<Line[]>([]),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [coupon, setCoupon] = useState("");
  useEffect(() => {
    api("/api/cart")
      .then((j) => setLines(j.lines))
      .catch(() => {});
  }, []);
  const mutate = useCallback(async (body: unknown) => {
    setBusy(true);
    try {
      const j = await api("/api/cart", body);
      setLines(j.lines);
      return true;
    } catch (e) {
      toast.error((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }, []);
  async function add(p: Product, n: number, variantId?: string) {
    if (
      await mutate({
        action: "add",
        productId: p.id,
        quantity: n,
        variantId: variantId || p.variants[0]?.id || "",
      })
    ) {
      setOpen(true);
      toast.success("Produto adicionado ao carrinho.");
    }
  }
  const whatsapp = (p?: Product) =>
    settings.whatsapp
      ? "https://wa.me/" +
        settings.whatsapp.replace(/\D/g, "") +
        "?text=" +
        encodeURIComponent(
          p
            ? "Olá, gostaria de saber mais sobre o produto: " +
                p.name +
                ". " +
                origin +
                "/produto/" +
                p.slug
            : "Olá, gostaria de solicitar um orçamento para minha operação.",
        )
      : "/contato?assunto=" +
        encodeURIComponent(p ? "Informações sobre " + p.name : "Orçamento");
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.quantity, 0);
  async function checkout() {
    setBusy(true);
    try {
      const j = await api("/api/checkout", { coupon });
      window.location.assign(j.checkoutUrl);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Context.Provider
      value={{
        settings,
        lines,
        add,
        openCart: () => setOpen(true),
        busy,
        whatsapp,
      }}
    >
      {children}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="cart-sheet">
          <SheetHeader>
            <SheetTitle className="cart-title">
              Seu carrinho{" "}
              <span>{lines.reduce((s, x) => s + x.quantity, 0)}</span>
            </SheetTitle>
            <SheetDescription>
              Equipamentos para a sua próxima operação.
            </SheetDescription>
          </SheetHeader>
          {lines.length ? (
            <>
              <div className="cart-lines">
                {lines.map((l, i) => (
                  <div key={l.product.id + l.variantId} className="cart-line">
                    <div className="cart-thumb">
                      {l.product.images[0] ? (
                        <img src={l.product.images[0]} alt={l.product.name} />
                      ) : (
                        <ShoppingBag size={26} />
                      )}
                    </div>
                    <div>
                      <a href={"/produto/" + l.product.slug}>
                        {l.product.name}
                      </a>
                      <small>{money(l.product.price)} / unidade</small>
                      {l.variantId && (
                        <small>
                          {
                            l.product.variants.find((v) => v.id === l.variantId)
                              ?.title
                          }
                        </small>
                      )}
                      <div className="quantity">
                        <button
                          aria-label={"Diminuir " + l.product.name}
                          disabled={busy}
                          onClick={() =>
                            mutate({
                              action: "update",
                              index: i,
                              quantity: l.quantity - 1,
                            })
                          }
                        >
                          <Minus size={14} />
                        </button>
                        <span>{l.quantity}</span>
                        <button
                          aria-label={"Aumentar " + l.product.name}
                          disabled={busy}
                          onClick={() =>
                            mutate({
                              action: "update",
                              index: i,
                              quantity: l.quantity + 1,
                            })
                          }
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="cart-line-end">
                      <strong>{money(l.product.price * l.quantity)}</strong>
                      <button
                        aria-label={"Excluir " + l.product.name}
                        disabled={busy}
                        onClick={() =>
                          mutate({ action: "update", index: i, quantity: 0 })
                        }
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-summary">
                <label>
                  Cupom de desconto
                  <input
                    value={coupon}
                    maxLength={50}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Digite seu cupom"
                  />
                </label>
                <small>Validado pela Shopify ao finalizar.</small>
                <div>
                  <span>Subtotal</span>
                  <b>{money(subtotal)}</b>
                </div>
                <div>
                  <span>Frete</span>
                  <span>Calculado no checkout</span>
                </div>
                <div className="total">
                  <span>Total dos produtos</span>
                  <b>{money(subtotal)}</b>
                </div>
                {lines.some((l) => l.product.demo) && (
                  <p className="notice">
                    Carrinho demonstrativo. A compra será liberada após conectar
                    os produtos reais à Shopify.
                  </p>
                )}
                <Button className="btn" disabled={busy} onClick={checkout}>
                  FINALIZAR COMPRA <ArrowRight size={18} />
                </Button>
                <a
                  className="text-link"
                  href="/contato?assunto=Orçamento do carrinho"
                >
                  Solicitar orçamento desses itens
                </a>
                <small className="secure-note">
                  <LockKeyhole size={13} />
                  Pagamento seguro no checkout Shopify
                </small>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <ShoppingBag size={44} />
              <h3>Seu próximo destino: o catálogo.</h3>
              <p>Encontre os equipamentos para sua operação.</p>
              <Button
                className="btn"
                onClick={() => {
                  setOpen(false);
                  window.location.assign("/produtos");
                }}
              >
                Explorar produtos
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <Toaster richColors position="bottom-center" />
      <Analytics settings={settings} />
    </Context.Provider>
  );
}
function Analytics({ settings }: { settings: Settings }) {
  const [consent, setConsent] = useState<string | null>(null);
  useEffect(() => {
    setConsent(localStorage.getItem("jj-analytics") || "pending");
  }, []);
  useEffect(() => {
    if (consent !== "yes") return;
    const w = window as any;
    w.dataLayer = w.dataLayer || [];
    const append = (src: string) => {
      if (document.querySelector('script[src="' + src + '"]')) return;
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      document.head.appendChild(s);
    };
    if (settings.gtm) {
      w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      append(
        "https://www.googletagmanager.com/gtm.js?id=" +
          encodeURIComponent(settings.gtm),
      );
    } else if (settings.ga) {
      w.gtag = function () {
        w.dataLayer.push(arguments);
      };
      w.gtag("js", new Date());
      w.gtag("config", settings.ga);
      append(
        "https://www.googletagmanager.com/gtag/js?id=" +
          encodeURIComponent(settings.ga),
      );
    }
    if (settings.pixel) {
      w.fbq =
        w.fbq ||
        function () {
          (w.fbq.queue = w.fbq.queue || []).push(arguments);
        };
      w.fbq.loaded = true;
      w.fbq.version = "2.0";
      append("https://connect.facebook.net/en_US/fbevents.js");
      w.fbq("init", settings.pixel);
      w.fbq("track", "PageView");
    }
  }, [consent, settings]);
  if (!(settings.ga || settings.gtm || settings.pixel) || consent !== "pending")
    return null;
  return (
    <div className="cookie-banner">
      <p>
        Podemos usar cookies de análise para melhorar a sua experiência?{" "}
        <a href="/politica-de-privacidade">Saiba mais</a>
      </p>
      {["yes", "no"].map((v) => (
        <Button
          key={v}
          onClick={() => {
            localStorage.setItem("jj-analytics", v);
            setConsent(v);
          }}
        >
          {v === "yes" ? "Aceitar" : "Recusar"}
        </Button>
      ))}
    </div>
  );
}
