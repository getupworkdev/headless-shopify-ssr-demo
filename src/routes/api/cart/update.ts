import { createFileRoute } from '@tanstack/react-router'
import { updateLine } from '~/lib/cart-actions'

export const Route = createFileRoute('/api/cart/update')({
  server: { handlers: { POST: ({ request }) => updateLine(request) } },
})
