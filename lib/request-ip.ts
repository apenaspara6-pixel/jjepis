import { env } from "@/lib/platform";
export function requestIp(request: Request) {
  const address = (env as any).VERCEL
    ? request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for")
    : request.headers.get("cf-connecting-ip");
  return address?.split(",")[0].trim() || "local";
}
