import { env } from "@/lib/platform";
import { z } from "zod";
import { storageAuthorized, boundedBody } from "@/lib/storage-bridge";
import { storageQueries } from "@/lib/storage-queries";

const requestSchema = z.object({ statements: z.array(z.object({
  sql: z.string().max(5000).refine(sql => storageQueries.includes(sql)),
  values: z.array(z.union([z.string(), z.number().finite(), z.null()])).max(30),
})).min(1).max(100) });
export async function POST(request: Request) {
  if (!storageAuthorized(request)) return new Response(null, { status: 404 });
  try {
    const parsed = requestSchema.safeParse(JSON.parse(new TextDecoder().decode(await boundedBody(request, 180000))));
    if (!parsed.success) return new Response(null, { status: 400 });
    const db = (env as any).DB as D1Database;
    const results = await db.batch(parsed.data.statements.map(s => db.prepare(s.sql).bind(...s.values)));
    return Response.json(results, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Storage request failed" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
