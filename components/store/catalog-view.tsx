"use client";
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, Search, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Shell } from "./chrome";
import { Button, Choice, ProductGrid } from "./primitives";
import {
  type Product,
  type Category,
  normalize,
  productMatches,
} from "@/lib/catalog";
export function Catalog({
  products,
  categories,
  category = "",
  query = "",
  risk = "",
  group = "",
}: {
  products: Product[];
  categories: Category[];
  category?: string;
  query?: string;
  risk?: string;
  group?: string;
}) {
  const [q, setQ] = useState(query),
    [cat, setCat] = useState(category),
    [stock, setStock] = useState(false),
    [novel, setNovel] = useState(false),
    [sort, setSort] = useState("relevant"),
    [min, setMin] = useState(""),
    [max, setMax] = useState(""),
    [cls, setCls] = useState(risk),
    [limit, setLimit] = useState(9),
    [filters, setFilters] = useState(false);
  const found = useMemo(() => {
    let r = products.filter(
      (p) =>
        (!cat || p.category === cat) &&
        (!group ||
          !["paineis-de-seguranca", "rotulos-de-risco"].includes(p.category)) &&
        (!stock || (!p.demo && p.stock > 0)) &&
        (!min || p.price >= Number(min)) &&
        (!max || p.price <= Number(max)) &&
        (!cls || p.riskClass === cls) &&
        (!novel || Date.now() - p.createdAt < 30 * 86400000) &&
        productMatches(p, q, categories.find((c) => c.id === p.category)?.name),
    );
    if (sort === "best")
      r.sort((a, b) => (a.salesRank ?? 99999) - (b.salesRank ?? 99999));
    if (sort === "low") r.sort((a, b) => a.price - b.price);
    if (sort === "high") r.sort((a, b) => b.price - a.price);
    if (sort === "recent" || novel) r.sort((a, b) => b.createdAt - a.createdAt);
    return r;
  }, [products, categories, cat, stock, novel, sort, min, max, cls, q, group]);
  useEffect(() => setLimit(9), [q, cat, stock, novel, sort, min, max, cls]);
  useEffect(() => {
    const ctx = (document as any).modelContext;
    if (!ctx?.registerTool) return;
    const life = new AbortController();
    Promise.resolve(
      ctx.registerTool(
        {
          name: "search_products",
          description:
            "Busca produtos por nome, SKU, categoria, descrição e tags e atualiza o catálogo visível.",
          inputSchema: {
            type: "object",
            properties: { query: { type: "string", maxLength: 120 } },
            required: ["query"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false },
          execute(input: any) {
            if (typeof input?.query !== "string" || input.query.length > 120)
              throw Error("Busca inválida");
            setQ(input.query);
            return {
              query: input.query,
              matches: products.filter((p) =>
                productMatches(
                  p,
                  input.query,
                  categories.find((c) => c.id === p.category)?.name,
                ),
              ).length,
            };
          },
        },
        { signal: life.signal },
      ),
    ).catch(() => {});
    return () => life.abort();
  }, [products]);
  function clear() {
    setCat("");
    setQ("");
    setStock(false);
    setNovel(false);
    setMin("");
    setMax("");
    setCls("");
    setSort("relevant");
  }
  const filterControls = (
    <>
      <div className="filter-group">
        <h3>Categorias</h3>
        <Choice
          label="Categoria"
          value={cat || "all"}
          onChange={(v) => setCat(v === "all" ? "" : v)}
          options={[
            { value: "all", label: "Todas as categorias" },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
      </div>
      <div className="filter-group">
        <h3>Preço</h3>
        <div className="price-inputs">
          <label>
            De R$
            <input
              type="number"
              min="0"
              value={min}
              placeholder="0"
              onChange={(e) => setMin(e.target.value)}
            />
          </label>
          <label>
            Até R$
            <input
              type="number"
              min="0"
              value={max}
              placeholder="Máximo"
              onChange={(e) => setMax(e.target.value)}
            />
          </label>
        </div>
      </div>
      <div className="filter-group">
        <h3>Disponibilidade</h3>
        <label className="filter-check">
          <Checkbox
            checked={stock}
            onCheckedChange={(v) => setStock(v === true)}
          />
          Em estoque
        </label>
        <label className="filter-check">
          <Checkbox
            checked={novel}
            onCheckedChange={(v) => setNovel(v === true)}
          />
          Novidades
        </label>
      </div>
      {(cat === "rotulos-de-risco" || cls) && (
        <div className="filter-group">
          <h3>Classificação</h3>
          <Choice
            label="Classe de risco"
            value={cls || "all"}
            onChange={(v) => setCls(v === "all" ? "" : v)}
            options={[
              { value: "all", label: "Todas as classes" },
              ...["2", "3", "8"].map((c) => ({
                value: c,
                label: "Classe " + c,
              })),
            ]}
          />
        </div>
      )}
      <div className="filter-group">
        <button className="clear" onClick={clear}>
          Limpar filtros
        </button>
        <p className="filter-note">
          Mais vendidos serão identificados após os primeiros pedidos reais.
        </p>
      </div>
    </>
  );
  const name =
    categories.find((c) => c.id === category)?.name ||
    "Produtos para sua operação";
  return (
    <Shell>
      <div className="container">
        <div className="breadcrumb">
          <a href="/">Início</a>
          <ChevronRight size={12} />
          <span>{category ? name : "Produtos"}</span>
        </div>
        <div className="page-top">
          <span className="eyebrow accent">CATÁLOGO JJ EPI'S</span>
          <h1>{name}</h1>
          <p>
            Encontre sinalização, proteção e conexões para cada etapa do seu
            trabalho.
          </p>
        </div>
        <div className="catalog-search searchbar">
          <input
            aria-label="Pesquisar no catálogo"
            placeholder="Busque por produto, categoria ou SKU…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Search size={20} />
        </div>
        <div className="catalog-body">
          <aside className="desktop-filters">{filterControls}</aside>
          <div className="catalog-main">
            <div className="catalog-toolbar">
              <span>
                {found.length}{" "}
                {found.length === 1
                  ? "produto encontrado"
                  : "produtos encontrados"}
              </span>
              <button className="mobile-only" onClick={() => setFilters(true)}>
                <SlidersHorizontal size={16} />
                Filtros
              </button>
              <Choice
                label="Ordenar produtos"
                value={sort}
                onChange={setSort}
                options={[
                  { value: "relevant", label: "Mais relevantes" },
                  { value: "low", label: "Menor preço" },
                  { value: "high", label: "Maior preço" },
                  { value: "recent", label: "Mais recentes" },
                  { value: "best", label: "Mais vendidos" },
                ]}
              />
            </div>
            {products.some((p) => p.demo) && (
              <p className="demo-caption">
                Itens demonstrativos. Valores e disponibilidade a confirmar.
              </p>
            )}
            {sort === "best" && products.every((p) => p.demo) && (
              <p className="notice">
                A ordem de mais vendidos estará disponível após conectar o
                histórico real da Shopify.
              </p>
            )}
            {found.length ? (
              <ProductGrid products={found.slice(0, limit)} />
            ) : (
              <div className="empty-state">
                <Search size={40} />
                <h3>Nenhum produto encontrado.</h3>
                <p>Experimente outro termo ou ajuste os filtros.</p>
                <Button className="btn btn-outline" onClick={clear}>
                  Limpar filtros
                </Button>
              </div>
            )}
            {found.length > limit && (
              <div className="load-more">
                <Button
                  className="btn btn-outline"
                  onClick={() => setLimit(limit + 9)}
                >
                  Carregar mais produtos
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Sheet open={filters} onOpenChange={setFilters}>
        <SheetContent side="left" className="mobile-menu">
          <SheetHeader>
            <SheetTitle>Filtrar produtos</SheetTitle>
            <SheetDescription>Refine sua busca.</SheetDescription>
          </SheetHeader>
          {filterControls}
          <Button className="btn" onClick={() => setFilters(false)}>
            Ver {found.length} {found.length === 1 ? "produto" : "produtos"}
          </Button>
        </SheetContent>
      </Sheet>
    </Shell>
  );
}
