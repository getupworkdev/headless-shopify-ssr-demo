// Cart mutations used by the /api/cart/* server routes. Plain HTML forms post here,
// so adding to cart works even with JavaScript disabled.
import { storefront } from './shopify'
import { CART_CREATE, CART_LINES_ADD, CART_LINES_REMOVE, CART_LINES_UPDATE } from './queries'

export const CART_COOKIE = 'cart_id'
const MAX_AGE = 60 * 60 * 24 * 14

type Result = { cart: { id: string } | null; userErrors: { message: string }[] }

export function readCartId(request: Request) {
  const cookie = request.headers.get('cookie') ?? ''
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${CART_COOKIE}=([^;]+)`))
  return match?.[1] ? decodeURIComponent(match[1]) : undefined
}

function cartCookie(id: string, request: Request) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
  return `${CART_COOKIE}=${encodeURIComponent(id)}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; SameSite=Lax${secure}`
}

export function redirectTo(location: string, request: Request, cartId?: string) {
  const headers = new Headers({ Location: location })
  if (cartId) headers.append('Set-Cookie', cartCookie(cartId, request))
  return new Response(null, { status: 303, headers })
}

function safeRedirect(value: FormDataEntryValue | null, fallback: string) {
  const v = typeof value === 'string' ? value : ''
  return v.startsWith('/') && !v.startsWith('//') ? v : fallback
}

function quantity(value: FormDataEntryValue | null, min: number) {
  const n = Math.floor(Number(value))
  return Number.isFinite(n) ? Math.min(Math.max(n, min), 99) : min
}

export async function addLine(request: Request) {
  const form = await request.formData()
  const merchandiseId = String(form.get('merchandiseId') ?? '')
  if (!merchandiseId.startsWith('gid://shopify/ProductVariant/')) {
    return new Response('Invalid variant', { status: 400 })
  }
  const lines = [{ merchandiseId, quantity: quantity(form.get('quantity'), 1) }]
  const existing = readCartId(request)

  let result: Result | undefined
  if (existing) {
    const r = await storefront<{ cartLinesAdd: Result }>(CART_LINES_ADD, { cartId: existing, lines })
    // An expired cart comes back null: fall through and create a new one.
    if (r.cartLinesAdd.cart) result = r.cartLinesAdd
  }
  if (!result) {
    result = (await storefront<{ cartCreate: Result }>(CART_CREATE, { lines })).cartCreate
  }
  if (!result.cart) return new Response(result.userErrors.map((e) => e.message).join('; ') || 'Cart error', { status: 422 })
  return redirectTo(safeRedirect(form.get('redirect'), '/cart'), request, result.cart.id)
}

export async function updateLine(request: Request) {
  const form = await request.formData()
  const cartId = readCartId(request)
  const lineId = String(form.get('lineId') ?? '')
  if (!cartId || !lineId) return redirectTo('/cart', request)
  const q = quantity(form.get('quantity'), 0)
  if (q === 0) {
    await storefront(CART_LINES_REMOVE, { cartId, lineIds: [lineId] })
  } else {
    await storefront(CART_LINES_UPDATE, { cartId, lines: [{ id: lineId, quantity: q }] })
  }
  return redirectTo('/cart', request)
}

export async function removeLine(request: Request) {
  const form = await request.formData()
  const cartId = readCartId(request)
  const lineId = String(form.get('lineId') ?? '')
  if (cartId && lineId) await storefront(CART_LINES_REMOVE, { cartId, lineIds: [lineId] })
  return redirectTo('/cart', request)
}
