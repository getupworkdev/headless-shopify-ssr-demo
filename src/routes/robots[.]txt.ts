import { createFileRoute } from '@tanstack/react-router'
import { siteUrl } from '~/lib/shopify'

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(`User-agent: *\nDisallow: /cart\nDisallow: /api/\nSitemap: ${siteUrl('/sitemap.xml')}\n`, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        }),
    },
  },
})
