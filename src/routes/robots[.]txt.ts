import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = (process.env.SITE_URL?.trim() || new URL(request.url).origin).replace(/\/$/, '')
        return new Response(`User-agent: *\nDisallow: /cart\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
      },
    },
  },
})
