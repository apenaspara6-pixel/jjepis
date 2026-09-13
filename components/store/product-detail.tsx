"use client";
import { useState } from "react";
import {
  Minus,
  Plus,
  ZoomIn,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Shell } from "./chrome";
import {
  ProductImage,
  ProductGrid,
  SectionHeading,
  Button,
  Choice,
} from "./primitives";
import { type Product, type Category, money } from "@/lib/catalog";
import { useStore } from "./context";
export function ProductDetail({
  product: p,
  products,
  categories,
}: {
  product: Product;
  products: Product[];
  categories: Category[];
}) {
  const { add, busy, whatsapp } = useStore();
  const [count, setCount] = useState(1),
    [img, setImg] = useState(0),
    [zoom, setZoom] = useState(false),
    [variant, setVariant] = useState(p.variants[0]?.id || "");
  const v = p.variants.find((v) => v.id === variant);
  const same = products.filter(
    (x) => x.category === p.category && x.id !== p.id,
  );
  const related = products.filter((x) => p.related.includes(x.id));
  const complement = products
    .filter((x) => x.category !== p.category)
    .slice(0, 4);
  const specs = {
    Código: p.sku,
    Dimensões: p.dimensions,
    Peso: p.weight,
    ...p.specifications,
  };
  return (
    <Shell>
      <div className="container detail-page">
        <div className="breadcrumb">
          <a href="/">Início</a>
          <ChevronRight size={12} />
          <a href="/produtos">Produtos</a>
          <ChevronRight size={12} />
          <span>{p.name}</span>
        </div>
        <div className="product-detail">
          <div>
            <button
              className="main-product-photo"
              aria-label="Ampliar fotografia do produto"
              onClick={() => setZoom(true)}
            >
              <ProductImage
                images={p.images[img] ? [p.images[img]] : []}
                name={p.name}
              />
              <span className="zoom-hint">
                <ZoomIn size={15} />
                Ampliar imagem
              </span>
            </button>
            <div className="gallery-thumbs">
              {p.images.map((src, i) => (
                <button
                  key={src}
                  className={img === i ? "active" : ""}
                  aria-label={"Ver foto " + (i + 1)}
                  onClick={() => setImg(i)}
                >
                  <img
                    src={src}
                    alt={p.name + " — foto " + (i + 1)}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="detail-copy">
            <a className="eyebrow accent" href={"/categoria/" + p.category}>
              {categories.find((c) => c.id === p.category)?.name || p.category}
            </a>
            <h1>{p.name}</h1>
            <p className="sku">Código / SKU: {p.sku || "A informar"}</p>
            <p>{p.shortDescription}</p>
            <div className="detail-price">
              {p.comparePrice > p.price && <del>{money(p.comparePrice)}</del>}
              <strong>{money(v?.price ?? p.price)}</strong>
            </div>
            <span className="availability">
              {p.demo
                ? "Preço de referência • disponibilidade a confirmar"
                : (v?.stock ?? p.stock) > 0
                  ? "Produto disponível"
                  : "Produto sem estoque"}
            </span>
            {p.demo && (
              <p className="notice">
                Cadastro demonstrativo. A fotografia real, os valores e as
                especificações serão confirmados antes da venda.
              </p>
            )}
            {p.variants.length > 0 && (
              <label>
                Modelo
                <Choice
                  label="Selecionar variante"
                  value={variant}
                  onChange={setVariant}
                  options={p.variants.map((v) => ({
                    value: v.id,
                    label: v.title,
                  }))}
                />
              </label>
            )}
            <div className="purchase-row">
              <div className="quantity">
                <button
                  aria-label="Diminuir quantidade"
                  disabled={count <= 1}
                  onClick={() => setCount(count - 1)}
                >
                  <Minus size={15} />
                </button>
                <span aria-live="polite">{count}</span>
                <button
                  aria-label="Aumentar quantidade"
                  disabled={count >= 99}
                  onClick={() => setCount(count + 1)}
                >
                  <Plus size={15} />
                </button>
              </div>
              <Button
                className="btn"
                disabled={busy || (!p.demo && (v?.stock ?? p.stock) === 0)}
                onClick={() => add(p, count, variant)}
              >
                COMPRAR
              </Button>
            </div>
            <div className="secondary-purchase">
              <Button
                className="btn btn-outline"
                disabled={busy || (!p.demo && (v?.stock ?? p.stock) === 0)}
                onClick={() => add(p, count, variant)}
              >
                Adicionar ao carrinho
              </Button>
              <a className="btn btn-outline" href={whatsapp(p)}>
                <MessageCircle size={16} />
                Consultar produto
              </a>
            </div>
            <p className="secure-note">
              <ShieldCheck size={16} />
              Frete e condições de pagamento confirmados no checkout.
            </p>
          </div>
        </div>
        <Tabs defaultValue="description" className="product-tabs">
          <TabsList>
            <TabsTrigger value="description">Descrição do produto</TabsTrigger>
            <TabsTrigger value="specs">Especificações técnicas</TabsTrigger>
            <TabsTrigger value="delivery">Entrega e atendimento</TabsTrigger>
          </TabsList>
          <TabsContent value="description">
            <p>
              {p.description ||
                "Consulte a equipe para receber a descrição completa e confirmar a aplicação."}
            </p>
          </TabsContent>
          <TabsContent value="specs">
            <table>
              <tbody>
                {Object.entries(specs)
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <tr key={k}>
                      <th>{k}</th>
                      <td>{v}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <p>
              Confirme material, aplicação, compatibilidade e conteúdo da
              embalagem com nossa equipe.
            </p>
          </TabsContent>
          <TabsContent value="delivery">
            <p>
              O prazo e o valor do frete dependem do destino e da
              disponibilidade. Para compras de frota ou modelos específicos,
              solicite um orçamento.
            </p>
            <a className="text-link" href="/contato">
              Falar com a equipe
            </a>
          </TabsContent>
        </Tabs>
        {related.length > 0 && (
          <section>
            <SectionHeading
              kicker="COMBINAÇÕES SELECIONADAS"
              title="Produtos relacionados."
            />
            <ProductGrid products={related.slice(0, 4)} swipe />
          </section>
        )}
        {same.length > 0 && (
          <section className="section">
            <SectionHeading
              kicker="EXPLORE MAIS OPÇÕES"
              title="Da mesma categoria."
            />
            <ProductGrid products={same.slice(0, 4)} swipe />
          </section>
        )}
        <section>
          <SectionHeading
            kicker="COMPLETE SUA COMPRA"
            title="Combine com sua operação."
          />
          <p className="demo-caption">
            Sugestões de itens complementares. Recomendações por compras
            conjuntas estarão disponíveis com o histórico real de pedidos.
          </p>
          <ProductGrid products={complement} swipe />
        </section>
      </div>
      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="zoom-dialog">
          <DialogTitle>{p.name}</DialogTitle>
          <DialogDescription>
            {p.images.length
              ? "Fotografia do produto ampliada."
              : "A fotografia real será adicionada em breve."}
          </DialogDescription>
          {p.images[img] ? (
            <img src={p.images[img]} alt={p.name} />
          ) : (
            <ProductImage images={[]} name={p.name} />
          )}
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
