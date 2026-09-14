export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  description: string;
  shortDescription: string;
  sku: string;
  price: number;
  comparePrice: number;
  stock: number;
  weight: string;
  dimensions: string;
  specifications: Record<string, string>;
  status: "active" | "hidden";
  tags: string[];
  images: string[];
  featured: boolean;
  related: string[];
  variants: { id: string; title: string; price: number; stock: number }[];
  demo: boolean;
  createdAt: number;
  source?: "shopify";
  salesRank?: number;
  riskClass?: string;
};
export type Category = {
  id: string;
  name: string;
  description: string;
  image: string;
};
export type Settings = {
  name: string;
  tagline: string;
  logo: string;
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  hero: string;
  secondaryBanner: string;
  ga: string;
  gtm: string;
  pixel: string;
  marketing: string;
  privacy: string;
  terms: string;
  returns: string;
};
export const defaults: Settings = {
  name: "JJ Epi’s",
  tagline: "SEGURANÇA RODOVIÁRIA",
  logo: "",
  whatsapp: "",
  phone: "",
  email: "",
  address: "",
  instagram: "",
  facebook: "",
  hero: "/images/tanker-hero.webp",
  secondaryBanner: "/images/tanker-inspection.webp",
  ga: "",
  gtm: "",
  pixel: "",
  marketing: "",
  privacy: "",
  terms: "",
  returns: "",
};
export const categories: Category[] = [
  {
    id: "paineis-de-seguranca",
    name: "Painéis de Segurança",
    description: "Identificação que acompanha sua carga.",
    image: "",
  },
  {
    id: "rotulos-de-risco",
    name: "Rótulos de Risco",
    description: "Sinalização clara para cada operação.",
    image: "",
  },
  {
    id: "conexoes",
    name: "Conectores e Mangueiras",
    description: "Conexões para o trabalho pesado.",
    image: "",
  },
  {
    id: "protecao",
    name: "Equipamentos de Proteção",
    description: "Cuidado com quem está na operação.",
    image: "",
  },
  {
    id: "sinalizacao",
    name: "Sinalização",
    description: "Mais segurança em cada parada.",
    image: "",
  },
  {
    id: "acessorios",
    name: "Outros Acessórios",
    description: "Os detalhes que fazem a diferença.",
    image: "",
  },
];
const rows = [
  [
    "Painel de Segurança 30 × 40 cm",
    "paineis-de-seguranca",
    49.9,
    0,
    "PS-3040",
    "30 × 40 cm",
  ],
  ["Rótulo de Risco • Classe 3", "rotulos-de-risco", 24.9, 29.9, "RR-CL3", ""],
  ["Engate rápido para mangueira", "conexoes", 129.9, 0, "ER-001", ""],
  ["Luva de proteção para operação", "protecao", 34.9, 0, "LP-001", ""],
  ["Cone de sinalização", "sinalizacao", 69.9, 79.9, "CS-001", ""],
  ["Conexão para caminhão-tanque", "conexoes", 159.9, 0, "CT-001", ""],
  [
    "Painel de Segurança intercambiável",
    "paineis-de-seguranca",
    89.9,
    0,
    "PS-INT",
    "",
  ],
  ["Suporte para identificação veicular", "acessorios", 59.9, 0, "SI-001", ""],
  ["Rótulo de Risco • Classe 8", "rotulos-de-risco", 24.9, 0, "RR-CL8", ""],
  ["Rótulo de Risco • Classe 2", "rotulos-de-risco", 24.9, 0, "RR-CL2", ""],
  ["Placa de identificação veicular", "sinalizacao", 39.9, 0, "PI-001", ""],
  [
    "Componente para mangueira de abastecimento",
    "conexoes",
    79.9,
    0,
    "CM-001",
    "",
  ],
] as const;
export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export const seedProducts: Product[] = rows.map((r, i) => ({
  id: "demo-" + (i + 1),
  name: r[0],
  slug: slugify(r[0]),
  category: r[1],
  subcategory: "",
  shortDescription:
    "Para operações de transporte, abastecimento e segurança rodoviária.",
  description:
    "Produto de referência para organização do catálogo. Material, aplicação, compatibilidade e demais especificações serão confirmados com o cadastro oficial. Consulte a equipe para selecionar o modelo adequado à sua operação.",
  sku: r[4],
  price: r[2],
  comparePrice: r[3],
  stock: 0,
  weight: "",
  dimensions: r[5],
  specifications: {},
  status: "active",
  tags: [r[0], r[1], "caminhao", "transporte"],
  images: [],
  featured: i < 8,
  related: [],
  variants: [],
  demo: true,
  createdAt: 1750000000 + i,
  riskClass: r[4].startsWith("RR-CL") ? r[4].slice(-1) : "",
}));
export const money = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    n,
  );
export const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://jj-epis-seguranca.jepfrancisco123.chatgpt.site";
export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function productMatches(p: Product, q: string, categoryName = "") {
  const text = normalize(
    [p.name, p.sku, p.category, categoryName, p.description, ...p.tags].join(
      " ",
    ),
  );
  const terms = normalize(q).trim().split(/\s+/).filter(Boolean);
  return terms.every((term) => {
    if (term === "cone" || term === "cones") return /\bcones?\b/.test(text);
    return text.includes(term);
  });
}
