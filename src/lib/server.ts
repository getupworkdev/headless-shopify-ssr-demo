// Server functions: these run only on the server. Route loaders call them during SSR,
// so every page's HTML already contains the Shopify data.
import { createServerFn } from '@tanstack/react-start'
import { getCookie, getRequestUrl } from '@tanstack/react-start/server'
import { notFound } from '@tanstack/react-router'
import { storefront } from './shopify'
import { CART_QUERY, COLLECTION_QUERY, COLLECTIONS_QUERY, HOME_QUERY, PRODUCT_QUERY } from './queries'
import { applyFilters, facets, parseFilters } from './catalog'
import type { Cart, Collection, Image, Product, ProductCard } from './types'

export { CART_COOKIE } from './cart-actions'
import { CART_COOKIE } from './cart-actions'

export const getHome = createServerFn({ method: 'GET' }).handler(async () => {
  const data = await storefront<{
    featured: { title: string; products: { nodes: ProductCard[] } } | null
    collections: { nodes: { handle: string; title: string; image: Image | null }[] }
  }>(HOME_QUERY)
  return { featured: data.featured?.products.nodes ?? [], collections: data.collections.nodes }
})

export const getNav = createServerFn({ method: 'GET' }).handler(async () => {
  const data = await storefront<{ collections: { nodes: { handle: string; title: string }[] } }>(COLLECTIONS_QUERY)
  return data.collections.nodes.filter((c) => c.handle !== 'featured')
})

export const getCollection = createServerFn({ method: 'GET' })
  .validator((input: { handle: string; search: Record<string, unknown> }) => input)
  .handler(async ({ data }) => {
    const res = await storefront<{ collection: (Collection & { products: { nodes: ProductCard[] } }) | null }>(
      COLLECTION_QUERY,
      { handle: data.handle },
    )
    if (!res.collection) throw notFound()
    const all = res.collection.products.nodes
    const filters = parseFilters(data.search)
    const { products: _drop, ...collection } = res.collection
    return { collection, products: applyFilters(all, filters), total: all.length, filters, facets: facets(all) }
  })

export const getProduct = createServerFn({ method: 'GET' })
  .validator((handle: string) => handle)
  .handler(async ({ data: handle }) => {
    const res = await storefront<{
      product:
        | (Omit<Product, 'images' | 'variants' | 'collections'> & {
            images: { nodes: Product['images'] }
            variants: { nodes: Product['variants'] }
            collections: { nodes: Product['collections'] }
          })
        | null
    }>(PRODUCT_QUERY, { handle })
    if (!res.product) throw notFound()
    const p = res.product
    return {
      ...p,
      images: p.images.nodes,
      variants: p.variants.nodes,
      collections: p.collections.nodes,
    } satisfies Product
  })

type RawCart = Omit<Cart, 'lines'> & { lines: { nodes: Cart['lines'] } }
export const flattenCart = (c: RawCart): Cart => ({ ...c, lines: c.lines.nodes })

export const getCart = createServerFn({ method: 'GET' }).handler(async (): Promise<Cart | null> => {
  const id = getCookie(CART_COOKIE)
  if (!id) return null
  const res = await storefront<{ cart: RawCart | null }>(CART_QUERY, { id })
  return res.cart ? flattenCart(res.cart) : null
})

// Absolute origin for canonical links and structured data: SITE_URL if set, otherwise
// the URL the request arrived on (works on any host without configuration).
export const getOrigin = createServerFn({ method: 'GET' }).handler(async () => {
  const fromEnv = process.env.SITE_URL?.trim().replace(/\/$/, '')
  return fromEnv || getRequestUrl({ xForwardedHost: true, xForwardedProto: true }).origin
})
