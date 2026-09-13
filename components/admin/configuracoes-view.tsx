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
export function AdminSettings({
  saveSettings,
  settingsField,
  settings,
  setSettings,
  busy,
}: {
  saveSettings: (e: React.FormEvent) => void;
  settingsField: (k: keyof CompanySettings, l: string) => React.ReactNode;
  settings: CompanySettings;
  setSettings: (s: CompanySettings) => void;
  busy: boolean;
}) {
  return (
    <form onSubmit={saveSettings}>
      <section className="admin-panel">
        <h2>Informações da empresa</h2>
        <p>Essas informações são usadas em todo o site.</p>
        <div className="form-grid">
          {(
            [
              ["name", "Nome da empresa"],
              ["tagline", "Assinatura da marca"],
              ["whatsapp", "WhatsApp (55 + DDD + número)"],
              ["phone", "Telefone"],
              ["email", "E-mail comercial"],
              ["address", "Endereço"],
              ["instagram", "Instagram (URL completa)"],
              ["facebook", "Facebook (URL completa)"],
            ] as [keyof CompanySettings, string][]
          ).map(([k, l]) => settingsField(k, l))}
        </div>
      </section>
      <section className="admin-panel">
        <h2>Logo</h2>
        <ImageUpload
          images={settings.logo ? [settings.logo] : []}
          max={1}
          onChange={(v) => setSettings({ ...settings, logo: v[0] || "" })}
        />
        <h2>Banner principal</h2>
        <ImageUpload
          images={settings.hero ? [settings.hero] : []}
          max={1}
          onChange={(v) =>
            setSettings({
              ...settings,
              hero: v[0] || "/images/tanker-hero.webp",
            })
          }
        />
        <h2>Banner secundário</h2>
        <ImageUpload
          images={settings.secondaryBanner ? [settings.secondaryBanner] : []}
          max={1}
          onChange={(v) =>
            setSettings({ ...settings, secondaryBanner: v[0] || "" })
          }
        />
      </section>
      <section className="admin-panel">
        <h2>Políticas da loja</h2>
        {(
          [
            ["privacy", "Política de Privacidade"],
            ["terms", "Termos de Uso"],
            ["returns", "Trocas e Devoluções"],
          ] as [keyof CompanySettings, string][]
        ).map(([k, l]) => (
          <label key={k}>
            {l}
            <textarea
              value={settings[k]}
              onChange={(e) =>
                setSettings({ ...settings, [k]: e.target.value })
              }
              placeholder="Insira o texto oficial revisado pela empresa."
            />
          </label>
        ))}
      </section>
      <Button type="submit" className="btn" disabled={busy}>
        Salvar configurações
      </Button>
    </form>
  );
}
