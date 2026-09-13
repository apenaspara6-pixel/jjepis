import { origin } from "@/lib/catalog";
export async function GET() {
  return new Response(
    "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /minha-conta\nSitemap: " +
      origin +
      "/sitemap.xml",
    { headers: { "Content-Type": "text/plain" } },
  );
}
