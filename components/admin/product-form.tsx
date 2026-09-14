"use client";
import { useState, useRef } from "react";
import {
  Upload,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Plus,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Choice } from "@/components/store/primitives";
import { type Product, type Category, slugify } from "@/lib/catalog";
import { api } from "@/components/store/context";
import { toast } from "sonner";
import { productSchema, productValidationIssues } from "@/lib/validation";
export function ImageUpload({
  images,
  onChange,
  max = 20,
}: {
  images: string[];
  onChange: (s: string[]) => void;
  max?: number;
}) {
  const [busy, setBusy] = useState(false),
    [libraryUrl, setLibraryUrl] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const drag = useRef<number | null>(null);
  async function upload(files: FileList | File[]) {
    if (files.length + images.length > max) {
      toast.error("Limite de " + max + " imagens.");
      return;
    }
    setBusy(true);
    const added: string[] = [];
    try {
      for (const file of Array.from(files)) {
        if (
          file.size > 5 * 1024 * 1024 ||
          !["image/jpeg", "image/png", "image/webp"].includes(file.type)
        )
          throw Error("Use JPG, PNG ou WebP de até 5 MB.");
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas
          .getContext("2d")!
          .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(Error("Imagem inválida"))),
            "image/webp",
            0.9,
          ),
        );
        const form = new FormData();
        if (blob.size > 4 * 1024 * 1024) throw Error("A imagem otimizada precisa ter até 4 MB. Use uma foto com resolução menor.");
        form.set("file", blob, file.name.replace(/\.[^.]+$/, "") + ".webp");
        const r = await fetch("/api/upload", { method: "POST", body: form });
        const j: any = await r.json();
        if (!r.ok) throw Error(j.error);
        added.push(j.url);
      }
      onChange([...images, ...added]);
      toast.success("Imagens enviadas. Salve o cadastro para aplicar.");
    } catch (e) {
      if (added.length) onChange([...images, ...added]);
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  function move(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [a] = next.splice(from, 1);
    next.splice(to, 0, a);
    onChange(next);
  }
  return (
    <div className="image-uploader">
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={max > 1}
        hidden
        style={{ display: "none" }}
        onChange={(e) => e.target.files && upload(e.target.files)}
      />
      <button
        type="button"
        className="upload-zone"
        disabled={busy}
        onClick={() => input.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!busy && e.dataTransfer.files.length)
            upload(e.dataTransfer.files);
        }}
      >
        <Upload size={27} />
        <b>
          {busy
            ? "Enviando imagens…"
            : "Arraste suas imagens ou clique para selecionar"}
        </b>
        <small>JPG, PNG e WebP · até 5 MB · proporção preservada</small>
      </button>
      <div className="library-reference">
        <label>
          Endereço de imagem da biblioteca
          <input
            value={libraryUrl}
            onChange={(e) => setLibraryUrl(e.target.value)}
            placeholder="Cole o endereço copiado na biblioteca"
          />
        </label>
        <Button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            if (
              !/^\/api\/media\/[a-f0-9-]{36}$/.test(libraryUrl) ||
              images.length >= max ||
              images.includes(libraryUrl)
            ) {
              toast.error("Confira o endereço e o limite de imagens.");
              return;
            }
            onChange([...images, libraryUrl]);
            setLibraryUrl("");
          }}
        >
          Adicionar imagem da biblioteca
        </Button>
      </div>
      <div className="admin-image-list">
        {images.map((src, i) => (
          <div
            key={src}
            draggable
            onDragStart={() => {
              drag.current = i;
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (drag.current !== null) move(drag.current, i);
              drag.current = null;
            }}
          >
            <img src={src} alt={"Imagem " + (i + 1)} loading="lazy" />
            <span>{i === 0 ? "Principal" : "Foto " + (i + 1)}</span>
            <div>
              <button
                type="button"
                aria-label={"Mover foto " + (i + 1) + " para a esquerda"}
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
              >
                <ArrowLeft size={15} />
              </button>
              <button
                type="button"
                aria-label={"Definir foto " + (i + 1) + " como principal"}
                onClick={() => move(i, 0)}
              >
                <ImageIcon size={15} />
              </button>
              <button
                type="button"
                aria-label={"Mover foto " + (i + 1) + " para a direita"}
                onClick={() => move(i, i + 1)}
                disabled={i === images.length - 1}
              >
                <ArrowRight size={15} />
              </button>
              <button
                type="button"
                aria-label={"Remover foto " + (i + 1)}
                onClick={() => onChange(images.filter((_, j) => i !== j))}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export function AdminProductForm({
  initial,
  categories,
  products,
  onSaved,
  onCancel,
}: {
  initial?: Product;
  categories: Category[];
  products: Product[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [p, setP] = useState<Product>(
      initial || {
        id: "",
        name: "",
        slug: "",
        category: categories[0]?.id || "",
        subcategory: "",
        description: "",
        shortDescription: "",
        sku: "",
        price: 0,
        comparePrice: 0,
        stock: 0,
        weight: "",
        dimensions: "",
        specifications: {},
        status: "hidden",
        tags: [],
        images: [],
        featured: false,
        related: [],
        variants: [],
        demo: false,
        createdAt: Date.now(),
        riskClass: "",
      },
    ),
    [busy, setBusy] = useState(false),
    [spec, setSpec] = useState(
      Object.entries(initial?.specifications || {})
        .map(([k, v]) => k + ": " + v)
        .join("\n"),
    ),
    [tags, setTags] = useState(initial?.tags.join(", ") || ""),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [saveError, setSaveError] = useState("");
  const set = (k: string, v: any) => setP((p) => ({ ...p, [k]: v }));
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSaveError("");
    try {
      const specifications = Object.fromEntries(
        spec
          .split("\n")
          .filter((x) => x.includes(":"))
          .map((x) => {
            const i = x.indexOf(":");
            return [x.slice(0, i).trim(), x.slice(i + 1).trim()];
          }),
      );
      const parsed = productSchema.safeParse({
        ...p,
        specifications,
        tags: tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      if (!parsed.success) {
        const issues = productValidationIssues(parsed.error);
        setErrors(Object.fromEntries(issues.map((issue) => [issue.path, issue.message])));
        toast.error(issues[0].message);
        const input = (e.currentTarget as HTMLFormElement).elements.namedItem(issues[0].path);
        if (input instanceof HTMLElement) input.focus();
        return;
      }
      setP(parsed.data);
      setBusy(true);
      await api("/api/admin/products", parsed.data);
      toast.success("Produto salvo com sucesso.");
      onSaved();
    } catch (e) {
      setSaveError((e as Error).message);
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const field = (key: keyof Product, label: string, type = "text") => (
    <label>
      {label}
      <input
        name={key}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `${key}-error` : key === "slug" ? "slug-hint" : undefined}
        type={type}
        value={String(p[key] ?? "")}
        onChange={(e) =>
          set(key, type === "number" ? Number(e.target.value) : e.target.value)
        }
        min={type === "number" ? 0 : undefined}
        step={["price", "comparePrice"].includes(key) ? ".01" : undefined}
        onBlur={key === "slug" ? () => set("slug", slugify(p.slug || p.name)) : undefined}
      />
      {key === "slug" && <small id="slug-hint">Gerado a partir do nome. Espaços e acentos são ajustados automaticamente.</small>}
      {errors[key] && <small id={`${key}-error`} className="form-field-error">{errors[key]}</small>}
    </label>
  );
  return (
    <form onSubmit={save} className="admin-product-form">
      <div className="admin-title">
        <div>
          <p className="eyebrow accent">CATÁLOGO</p>
          <h1>{initial ? "Editar produto" : "Novo produto"}</h1>
        </div>
        <div className="admin-actions">
          <Button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={busy} className="btn">
            {busy ? "Salvando…" : "Salvar produto"}
          </Button>
        </div>
      </div>
      {(saveError || Object.keys(errors).length > 0) && (
        <div className="form-error-summary" role="alert">
          <b>Confira os dados para salvar o produto.</b>
          {saveError && <p>{saveError}</p>}
          {Object.entries(errors).map(([key, message]) => <p key={key}>{message}</p>)}
        </div>
      )}
      <div className="admin-form-layout">
        <div>
          <section className="admin-panel">
            <h2>Informações do produto</h2>
            <div className="form-grid">
              <label className="span-2">
                Nome do produto
                <input
                  name="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  required
                  minLength={3}
                  maxLength={180}
                  value={p.name}
                  onChange={(e) => {
                    set("name", e.target.value);
                    if (!initial) set("slug", slugify(e.target.value));
                  }}
                />
                {errors.name && <small id="name-error" className="form-field-error">{errors.name}</small>}
              </label>
              {field("slug", "Endereço / slug")}
              {field("sku", "Código / SKU")}
              <label>
                Categoria
                <Choice
                  value={p.category}
                  label="Categoria do produto"
                  onChange={(v) => set("category", v)}
                  options={categories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                />
              </label>
              {field("subcategory", "Subcategoria")}
              <label className="span-2">
                Descrição curta
                <textarea
                  maxLength={500}
                  value={p.shortDescription}
                  onChange={(e) => set("shortDescription", e.target.value)}
                />
              </label>
              <label className="span-2">
                Descrição completa
                <textarea
                  value={p.description}
                  maxLength={16000}
                  onChange={(e) => set("description", e.target.value)}
                />
              </label>
            </div>
          </section>
          <section className="admin-panel">
            <h2>Imagens do produto</h2>
            <p>
              A primeira foto será usada no catálogo, nos destaques e na página
              do produto. Arraste para reordenar ou use as setas.
            </p>
            <ImageUpload images={p.images} onChange={(v) => set("images", v)} />
          </section>
          <section className="admin-panel">
            <h2>Preço e estoque</h2>
            <div className="form-grid">
              {field("price", "Preço de venda (R$)", "number")}
              {field(
                "comparePrice",
                "Preço anterior (R$) — 0 sem promoção",
                "number",
              )}
              {field("stock", "Estoque disponível", "number")}
              {field("weight", "Peso (com unidade)")}
              {field("dimensions", "Dimensões (com unidade)")}
              {field("riskClass", "Classe de risco (quando aplicável)")}
            </div>
          </section>
          <section className="admin-panel">
            <h2>Especificações técnicas</h2>
            <label>
              Uma especificação por linha: nome: valor
              <textarea
                value={spec}
                onChange={(e) => setSpec(e.target.value)}
                placeholder="Material: informe o material real&#10;Aplicação: informe a aplicação&#10;Compatibilidade: informe os modelos"
              />
            </label>
          </section>
          <section className="admin-panel">
            <h2>Variantes</h2>
            <p>
              Cadastre modelos, medidas ou versões com preço e estoque próprios.
            </p>
            {p.variants.map((v, i) => (
              <div key={v.id} className="variant-row">
                <label>
                  Modelo
                  <input
                    required
                    value={v.title}
                    onChange={(e) =>
                      set(
                        "variants",
                        p.variants.map((x, j) =>
                          j === i ? { ...x, title: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  Preço
                  <input
                    type="number"
                    min="0"
                    step=".01"
                    value={v.price}
                    onChange={(e) =>
                      set(
                        "variants",
                        p.variants.map((x, j) =>
                          j === i ? { ...x, price: Number(e.target.value) } : x,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  Estoque
                  <input
                    type="number"
                    min="0"
                    value={v.stock}
                    onChange={(e) =>
                      set(
                        "variants",
                        p.variants.map((x, j) =>
                          j === i ? { ...x, stock: Number(e.target.value) } : x,
                        ),
                      )
                    }
                  />
                </label>
                <button
                  type="button"
                  aria-label={"Excluir variante " + v.title}
                  onClick={() =>
                    set(
                      "variants",
                      p.variants.filter((_, j) => j !== i),
                    )
                  }
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <Button
              type="button"
              className="btn btn-outline"
              onClick={() =>
                set("variants", [
                  ...p.variants,
                  {
                    id: crypto.randomUUID(),
                    title: "",
                    price: p.price,
                    stock: 0,
                  },
                ])
              }
            >
              <Plus size={16} />
              Adicionar variante
            </Button>
          </section>
        </div>
        <aside>
          <section className="admin-panel">
            <h2>Publicação</h2>
            <label>
              Status
              <Choice
                value={p.status}
                onChange={(v) => set("status", v)}
                label="Status do produto"
                options={[
                  { value: "active", label: "Ativo" },
                  { value: "hidden", label: "Oculto" },
                ]}
              />
            </label>
            <label className="switch-label">
              <Switch
                checked={p.featured}
                onCheckedChange={(v) => set("featured", v)}
              />
              Produto em destaque
            </label>
            <label className="switch-label">
              <Switch
                checked={p.demo}
                onCheckedChange={(v) => set("demo", v)}
              />
              Cadastro demonstrativo
            </label>
            <p>
              Desative o modo demonstrativo somente após confirmar dados, preços
              e estoque.
            </p>
          </section>
          <section className="admin-panel">
            <h2>Organização</h2>
            <label>
              Tags separadas por vírgula
              <textarea
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </label>
          </section>
          <section className="admin-panel">
            <h2>Produtos relacionados</h2>
            <div className="related-picker">
              {products
                .filter((x) => x.id !== p.id)
                .map((x) => (
                  <label key={x.id} className="filter-check">
                    <Checkbox
                      checked={p.related.includes(x.id)}
                      onCheckedChange={(v) =>
                        set(
                          "related",
                          v
                            ? [...p.related, x.id]
                            : p.related.filter((id) => id !== x.id),
                        )
                      }
                    />
                    {x.name}
                  </label>
                ))}
            </div>
          </section>
        </aside>
      </div>
      <Button className="btn" type="submit" disabled={busy}>
        Salvar produto
      </Button>
    </form>
  );
}
