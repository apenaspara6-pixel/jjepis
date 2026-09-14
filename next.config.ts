import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: { resolveAlias: { "@/lib/platform": "./lib/vercel-runtime.ts" } },
  webpack(config, { webpack }) {
    config.resolve.alias["@/lib/platform"] = path.resolve("lib/vercel-runtime.ts");
    config.plugins.push(new webpack.NormalModuleReplacementPlugin(/^cloudflare:workers$/, path.resolve("lib/vercel-runtime.ts")));
    return config;
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://jj-epis-seguranca.jepfrancisco123.chatgpt.site"),
  },
};

export default nextConfig;
