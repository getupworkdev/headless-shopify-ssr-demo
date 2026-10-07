import { createFileRoute } from '@tanstack/react-router'
import { validateQuote } from '~/lib/quote'

// Phase 1 has no integration: the request is validated and acknowledged.
// This is where a CRM, e-signature or booking call would go later.
export const Route = createFileRoute('/api/quote')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData()
        const { errors } = validateQuote(form)
        const params = new URLSearchParams()
        if (Object.keys(errors).length) {
          params.set('error', Object.keys(errors).join(','))
          for (const k of ['name', 'contact', 'postcode', 'property', 'message']) {
            const v = form.get(k)
            if (typeof v === 'string' && v) params.set(k, v)
          }
        } else {
          params.set('sent', '1')
        }
        return new Response(null, { status: 303, headers: { Location: `/quote?${params}` } })
      },
    },
  },
})
