# Vercel hosting

Vercel runs the Next.js storefront, administration, authentication and API routes. Existing products, settings, sessions, carts, messages and uploaded photos remain in the existing D1/R2 storage service, preserving one source of data while changing the web host. Keep that service deployed while Vercel uses it.

`npm run build:vercel` builds Next.js with the server-only adapter in `lib/vercel-runtime.ts`. The existing `npm run build` continues to build the storage service and original storefront for Sites. Both use the same source and validation rules.

Configure `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ADMIN_PASSWORD_PEPPER`, `STORAGE_BRIDGE_URL` and `STORAGE_BRIDGE_SECRET` as server environment variables in Vercel. Mark credentials as sensitive. Only `NEXT_PUBLIC_SITE_URL` is public. Set `STORAGE_BRIDGE_ENABLED=true` and the same random 32-byte hexadecimal bridge secret on the D1/R2 service; the Vercel adapter always disables bridge-server routes.

The storage service rejects unauthenticated calls. Database calls use only exact prepared statements collected by `scripts/generate-storage-queries.mjs`; arbitrary SQL, schema changes and unbound values are not accepted. Batches retain D1 transaction behavior. Photos remain accessible through the same relative `/api/media/<uuid>` paths. Uploads retain image validation and compression.

When prepared statements change, build and deploy the D1/R2 service before deploying the matching Vercel source. Never remove the storage service or rotate its secret independently of Vercel. A later database-provider migration can replace the platform adapter without replacing the storefront or product components.

The production Vercel URL is used for product links, organization metadata, sitemap and checkout returns through `NEXT_PUBLIC_SITE_URL` or Vercel's production-domain environment value. Shopify and contact channels still require the store's real configuration.
