"use client";
import {
  ImageIcon,
  ArrowUpRight,
  PanelsTopLeft,
  TriangleAlert,
  Plug,
  ShieldCheck,
  TrafficCone,
  Package,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { type Product, type Category, money, categories } from "@/lib/catalog";
import { useStore } from "./context";
export { Button };
export const categoryIcons = [
  PanelsTopLeft,
  TriangleAlert,
  Plug,
  ShieldCheck,
  TrafficCone,
  Package,
];
export function Choice({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (s: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="choice">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((x) => (
          <SelectItem key={x.value} value={x.value}>
            {x.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export function ProductImage({
  images,
  name,
  className = "",
}: {
  images: string[];
  name: string;
  className?: string;
}) {
  return (
    <div className={"product-image " + className}>
      {images[0] ? (
        <img src={images[0]} alt={name} loading="lazy" decoding="async" />
      ) : (
        <div className="photo-placeholder">
          <ImageIcon size={34} strokeWidth={1} />
          <span>FOTO EM BREVE</span>
          <small>Imagem real a ser adicionada</small>
        </div>
      )}
    </div>
  );
}
export function ProductCard({ product: p }: { product: Product }) {
  const { add, busy } = useStore();
  return (
    <article className="product-card reveal">
      <a href={"/produto/" + p.slug} aria-label={"Ver " + p.name}>
        <ProductImage images={p.images} name={p.name} />
      </a>
      <div className="product-info">
        <span className="eyebrow">
          {categories.find((c) => c.id === p.category)?.name || p.category}
        </span>
        <a href={"/produto/" + p.slug}>
          <h3>{p.name}</h3>
        </a>
        <div className="price-row">
          {p.comparePrice > p.price && <del>{money(p.comparePrice)}</del>}
          <strong>{money(p.price)}</strong>
        </div>
        <small>
          {p.demo
            ? "Valor demonstrativo • confirme no orçamento"
            : p.stock > 0
              ? "Disponível para compra"
              : "Sem estoque"}
        </small>
        <div className="card-actions">
          <Button
            className="btn buy"
            disabled={busy || (!p.demo && p.stock === 0)}
            onClick={() => add(p, 1)}
          >
            <Package size={15} />
            Comprar
          </Button>
          <a className="detail-link" href={"/produto/" + p.slug}>
            Ver detalhes <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </article>
  );
}
export function ProductGrid({
  products,
  swipe = false,
}: {
  products: Product[];
  swipe?: boolean;
}) {
  return (
    <div className={"product-grid " + (swipe ? "swipe-grid" : "")}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
export function CategoryCard({
  category: c,
  index,
}: {
  category: Category;
  index: number;
}) {
  const Icon =
    categoryIcons[
      Math.max(
        0,
        categories.findIndex((x) => x.id === c.id),
      ) % categoryIcons.length
    ];
  return (
    <a href={"/categoria/" + c.id} className="category-card reveal">
      <div className="category-media">
        {c.image ? (
          <img src={c.image} alt={c.name} loading="lazy" />
        ) : (
          <>
            <Icon size={45} strokeWidth={1} />
            <span>FOTO EM BREVE</span>
          </>
        )}
      </div>
      <div className="category-copy">
        <span className="category-number">0{index + 1}</span>
        <h3>{c.name}</h3>
        <p>{c.description}</p>
        <span className="category-link">
          Ver produtos <ArrowUpRight size={18} />
        </span>
      </div>
    </a>
  );
}
export function SectionHeading({
  kicker,
  title,
  href,
  link = "Ver todos os produtos",
}: {
  kicker: string;
  title: string;
  href?: string;
  link?: string;
}) {
  return (
    <div className="section-heading reveal">
      <div>
        <p className="eyebrow accent">{kicker}</p>
        <h2>{title}</h2>
      </div>
      {href && (
        <a className="text-link" href={href}>
          {link}
          <ArrowUpRight size={18} />
        </a>
      )}
    </div>
  );
}
