export const dynamic = 'force-dynamic'

import { listProducts, listCategories } from "@/lib/repository";
import { origin } from "@/lib/catalog";
export async function GET() {
  const [ps, cs] = await Promise.all([listProducts(), listCategories()]);
  const urls = [
    "/",
    "/produtos",
    "/sobre",
    "/contato",
    ...cs.map((c) => "/categoria/" + c.id),
    ...ps.filter((p) => !p.demo).map((p) => "/produto/" + p.slug),
  ];
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      urls.map((u) => "<url><loc>" + origin + u + "</loc></url>").join("") +
      "</urlset>",
    { headers: { "Content-Type": "application/xml" } },
  );
}

