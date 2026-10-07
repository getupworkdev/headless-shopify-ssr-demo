import { Link, createFileRoute } from '@tanstack/react-router'
import { getCart } from '~/lib/server'
import { formatMoney, shopifyImage } from '~/lib/catalog'

export const Route = createFileRoute('/cart')({
  loader: () => getCart(),
  head: () => ({ meta: [{ title: 'Cart | Northwind Supply' }, { name: 'robots', content: 'noindex' }] }),
  component: CartPage,
})

function CartPage() {
  const cart = Route.useLoaderData()
  if (!cart || cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold">Your cart is empty</h1>
        <Link to="/collections/$handle" params={{ handle: 'featured' }} className="mt-6 inline-block rounded-full bg-ink px-5 py-2 text-paper">
          Continue shopping
        </Link>
      </div>
    )
  }
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Cart</h1>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {cart.lines.map((line) => (
          <li key={line.id} className="flex gap-4 py-5">
            {line.merchandise.image && (
              <img src={shopifyImage(line.merchandise.image.url, 200)} width={96} height={96} alt="" className="h-24 w-24 rounded-lg bg-white object-cover" />
            )}
            <div className="flex-1">
              <Link to="/products/$handle" params={{ handle: line.merchandise.product.handle }} className="font-medium hover:underline">
                {line.merchandise.product.title}
              </Link>
              <p className="text-sm text-muted">{line.merchandise.selectedOptions.map((o) => `${o.name}: ${o.value}`).join(' · ')}</p>
              <div className="mt-3 flex items-center gap-3 text-sm">
                <form method="post" action="/api/cart/update" className="flex items-center gap-2">
                  <input type="hidden" name="lineId" value={line.id} />
                  <label className="sr-only" htmlFor={`q-${line.id}`}>Quantity</label>
                  <input id={`q-${line.id}`} name="quantity" type="number" min={0} max={99} defaultValue={line.quantity} className="w-16 rounded-md border border-line bg-white px-2 py-1 text-center" />
                  <button className="underline">Update</button>
                </form>
                <form method="post" action="/api/cart/remove">
                  <input type="hidden" name="lineId" value={line.id} />
                  <button className="text-muted underline">Remove</button>
                </form>
              </div>
            </div>
            <p className="whitespace-nowrap font-medium">{formatMoney(line.cost.totalAmount)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col items-end gap-3">
        <p className="text-lg">
          Subtotal <span className="ml-3 font-semibold">{formatMoney(cart.cost.subtotalAmount)}</span>
        </p>
        <p className="text-sm text-muted">Shipping and payment options are handled by Shopify checkout.</p>
        {/* Hand-off to Shopify's hosted checkout, where the store's payment setup (e.g. Klarna) applies unchanged. */}
        <a href={cart.checkoutUrl} className="rounded-full bg-brand px-8 py-3 font-medium text-white hover:bg-brand-dark">
          Checkout
        </a>
      </div>
    </div>
  )
}
