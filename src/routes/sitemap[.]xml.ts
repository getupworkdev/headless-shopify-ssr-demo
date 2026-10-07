import { createFileRoute } from '@tanstack/react-router'
import { storefront, siteUrl } from '~/lib/shopify'
import { SITEMAP_QUERY } from '~/lib/queries'

type Node = { handle: string; updatedAt: string }

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const data = await storefront<{ products: { nodes: Node[] }; collections: { nodes: Node[] } }>(SITEMAP_QUERY)
        const url = (loc: string, lastmod?: string) =>
          `<url><loc>${siteUrl(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
        const body = [
          url('/'),
          url('/quote'),
          ...data.collections.nodes.map((c) => url(`/collections/${c.handle}`, c.updatedAt)),
          ...data.products.nodes.map((p) => url(`/products/${p.handle}`, p.updatedAt)),
        ].join('')
        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`,
          { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } },
        )
      },
    },
  },
})
