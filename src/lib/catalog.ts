// Pure helpers, no I/O. Shared by the server and unit tests.
import type { CollectionFilters, ProductCard, Variant, Money } from './types'

export function parseFilters(search: Record<string, unknown>): CollectionFilters {
  const num = (v: unknown) => {
    const n = typeof v === 'string' || typeof v === 'number' ? Number(v) : NaN
    return Number.isFinite(n) && n >= 0 ? n : undefined
  }
  const opt: Record<string, string> = {}
  for (const [k, v] of Object.entries(search)) {
    if (k.startsWith('opt.') && typeof v === 'string' && v) opt[k.slice(4)] = v
  }
  const sort = search.sort
  return {
    inStock: search.inStock === '1' || search.inStock === 1 || search.inStock === true || undefined,
    min: num(search.min),
    max: num(search.max),
    tag: typeof search.tag === 'string' && search.tag ? search.tag : undefined,
    opt: Object.keys(opt).length ? opt : undefined,
    sort:
      sort === 'price-asc' || sort === 'price-desc' || sort === 'title' || sort === 'featured'
        ? sort
        : undefined,
  }
}

export function applyFilters(products: ProductCard[], f: CollectionFilters): ProductCard[] {
  const price = (p: ProductCard) => Number(p.priceRange.minVariantPrice.amount)
  let out = products.filter((p) => {
    if (f.inStock && !p.availableForSale) return false
    if (f.min !== undefined && price(p) < f.min) return false
    if (f.max !== undefined && price(p) > f.max) return false
    if (f.tag && !p.tags.includes(f.tag)) return false
    if (f.opt) {
      for (const [name, value] of Object.entries(f.opt)) {
        const option = p.options.find((o) => o.name === name)
        if (!option || !option.optionValues.some((v) => v.name === value)) return false
      }
    }
    return true
  })
  if (f.sort === 'price-asc') out = [...out].sort((a, b) => price(a) - price(b))
  if (f.sort === 'price-desc') out = [...out].sort((a, b) => price(b) - price(a))
  if (f.sort === 'title') out = [...out].sort((a, b) => a.title.localeCompare(b.title))
  return out
}

// Facets are computed from the unfiltered collection so every option stays reachable.
export function facets(products: ProductCard[]) {
  const options = new Map<string, Set<string>>()
  const tags = new Set<string>()
  for (const p of products) {
    p.tags.forEach((t) => tags.add(t))
    for (const o of p.options) {
      if (o.name === 'Title') continue // Shopify's placeholder option for single-variant products
      const set = options.get(o.name) ?? new Set<string>()
      o.optionValues.forEach((v) => set.add(v.name))
      options.set(o.name, set)
    }
  }
  return {
    tags: [...tags].sort(),
    options: [...options.entries()].map(([name, values]) => ({ name, values: [...values] })),
  }
}

// Resolve the selected variant from the URL. `?variant=<numeric id>` wins; otherwise
// option params (?Color=Green&Size=Small) are matched; otherwise the first available variant.
export function selectVariant(variants: Variant[], search: Record<string, unknown>): Variant | undefined {
  const byId = typeof search.variant === 'string' || typeof search.variant === 'number' ? String(search.variant) : ''
  if (byId) {
    const hit = variants.find((v) => v.id.endsWith(`/${byId}`))
    if (hit) return hit
  }
  return variants.find((v) => v.availableForSale) ?? variants[0]
}

// For each option value, the variant you land on if you pick it while keeping the other options.
export function variantForOption(variants: Variant[], current: Variant, name: string, value: string) {
  const wanted = current.selectedOptions.map((o) => (o.name === name ? { name, value } : o))
  return (
    variants.find((v) => wanted.every((w) => v.selectedOptions.some((s) => s.name === w.name && s.value === w.value))) ??
    variants.find((v) => v.selectedOptions.some((s) => s.name === name && s.value === value))
  )
}

export function numericId(gid: string) {
  return gid.split('/').pop()?.split('?')[0] ?? gid
}

export function formatMoney(m: Money, locale = 'en') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: m.currencyCode }).format(Number(m.amount))
}

export function shopifyImage(url: string, width: number) {
  const u = new URL(url)
  u.searchParams.set('width', String(width))
  return u.toString()
}
