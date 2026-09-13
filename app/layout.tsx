import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/components/store/context";
import { origin } from "@/lib/catalog";
import { getSettings } from "@/lib/repository";
export const metadata: Metadata = {
  title: {
    default: "JJ Epi’s | Segurança em cada quilômetro",
    template: "%s | JJ Epi’s",
  },
  description:
    "Painéis de Segurança, Rótulos de Risco, conexões e equipamentos para transporte de combustíveis e cargas perigosas.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "JJ Epi’s | Segurança em cada quilômetro",
    description: "Segurança, sinalização e acessórios para quem move o Brasil.",
    locale: "pt_BR",
    type: "website",
  },
};
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <html lang="pt-BR">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: settings.name,
              url: origin,
              ...(settings.logo
                ? { logo: new URL(settings.logo, origin).href }
                : {}),
              ...(settings.email ? { email: settings.email } : {}),
              ...(settings.phone ? { telephone: settings.phone } : {}),
            }).replace(/</g, "\\u003c"),
          }}
        />
        <StoreProvider settings={settings}>{children}</StoreProvider>
      </body>
    </html>
  );
}
