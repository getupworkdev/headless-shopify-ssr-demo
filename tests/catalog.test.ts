import { describe, expect, it } from 'vitest'
import { applyFilters, facets, parseFilters, selectVariant, variantForOption } from '../src/lib/catalog'
import type { ProductCard, Variant } from '../src/lib/types'

const money = (amount: string) => ({ amount, currencyCode: 'SEK' })
const card = (handle: string, price: string, opts: Record<string, string[]>, extra: Partial<ProductCard> = {}): ProductCard => ({
  id: handle,
  handle,
  title: handle,
  availableForSale: true,
  tags: [],
  featuredImage: null,
  priceRange: { minVariantPrice: money(price), maxVariantPrice: money(price) },
  options: Object.entries(opts).map(([name, values]) => ({ name, optionValues: values.map((v) => ({ name: v })) })),
  ...extra,
})
const variant = (n: number, capacity: string, colour: string, available = true): Variant => ({
  id: `gid://shopify/ProductVariant/${n}`,
  title: `${capacity} / ${colour}`,
  availableForSale: available,
  sku: null,
  price: money('10000'),
  compareAtPrice: null,
  image: null,
  selectedOptions: [
    { name: 'Capacity', value: capacity },
    { name: 'Colour', value: colour },
  ],
})

const products = [
  card('a', '25000', { Capacity: ['6 kW', '8 kW'] }),
  card('b', '32000', { Capacity: ['8 kW', '12 kW'] }, { availableForSale: false }),
  card('c', '18000', { Capacity: ['6 kW'] }, { tags: ['quiet'] }),
]

describe('filters from the URL', () => {
  it('parses known params and ignores junk', () => {
    expect(parseFilters({ inStock: '1', min: '20000', max: 'abc', sort: 'price-asc', 'opt.Capacity': '8 kW', other: 'x' })).toEqual({
      inStock: true,
      min: 20000,
      max: undefined,
      tag: undefined,
      opt: { Capacity: '8 kW' },
      sort: 'price-asc',
    })
  })

  it('filters by option, stock and price, then sorts', () => {
    expect(applyFilters(products, parseFilters({ 'opt.Capacity': '8 kW' })).map((p) => p.handle)).toEqual(['a', 'b'])
    expect(applyFilters(products, parseFilters({ inStock: '1' })).map((p) => p.handle)).toEqual(['a', 'c'])
    expect(applyFilters(products, parseFilters({ max: '26000', sort: 'price-asc' })).map((p) => p.handle)).toEqual(['c', 'a'])
    expect(applyFilters(products, parseFilters({ tag: 'quiet' })).map((p) => p.handle)).toEqual(['c'])
  })

  it('builds facets from the whole collection', () => {
    expect(facets(products).options).toEqual([{ name: 'Capacity', values: ['6 kW', '8 kW', '12 kW'] }])
  })
})

describe('variant selection', () => {
  const variants = [variant(1, '6 kW', 'White', false), variant(2, '6 kW', 'Black'), variant(3, '8 kW', 'White')]

  it('uses ?variant= when it matches, else the first available variant', () => {
    expect(selectVariant(variants, { variant: 3 })?.id).toMatch(/\/3$/)
    expect(selectVariant(variants, { variant: '999' })?.id).toMatch(/\/2$/)
    expect(selectVariant(variants, {})?.id).toMatch(/\/2$/)
  })

  it('keeps the other options when one option changes', () => {
    const current = variants[1]!
    expect(variantForOption(variants, current, 'Colour', 'White')?.id).toMatch(/\/1$/)
    expect(variantForOption(variants, current, 'Capacity', '8 kW')?.id).toMatch(/\/3$/)
  })
})
