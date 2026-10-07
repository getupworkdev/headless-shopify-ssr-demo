import { createFileRoute } from '@tanstack/react-router'
import { removeLine } from '~/lib/cart-actions'

export const Route = createFileRoute('/api/cart/remove')({
  server: { handlers: { POST: ({ request }) => removeLine(request) } },
})
