import { createFileRoute } from '@tanstack/react-router'
import { addLine } from '~/lib/cart-actions'

export const Route = createFileRoute('/api/cart/add')({
  server: { handlers: { POST: ({ request }) => addLine(request) } },
})
