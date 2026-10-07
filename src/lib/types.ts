export type Money = { amount: string; currencyCode: string }
export type Image = { url: string; altText: string | null; width: number | null; height: number | null }

export type ProductCard = {
  id: string
  handle: string
  title: string
  availableForSale: boolean
  tags: string[]
  featuredImage: Image | null
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money }
  options: { name: string; optionValues: { name: string }[] }[]
}

export type Variant = {
  id: string
  title: string
  availableForSale: boolean
  sku: string | null
  price: Money
  compareAtPrice: Money | null
  image: Image | null
  selectedOptions: { name: string; value: string }[]
}

export type Product = {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  vendor: string
  tags: string[]
  seo: { title: string | null; description: string | null }
  images: Image[]
  options: { name: string; optionValues: { name: string }[] }[]
  variants: Variant[]
  collections: { handle: string; title: string }[]
}

export type Collection = {
  handle: string
  title: string
  description: string
  seo: { title: string | null; description: string | null }
  image: Image | null
}

export type CartLine = {
  id: string
  quantity: number
  cost: { totalAmount: Money }
  merchandise: {
    id: string
    title: string
    image: Image | null
    selectedOptions: { name: string; value: string }[]
    product: { handle: string; title: string }
  }
}

export type Cart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: { subtotalAmount: Money; totalAmount: Money }
  lines: CartLine[]
}

export type CollectionFilters = {
  inStock?: boolean
  min?: number
  max?: number
  tag?: string
  // Product option filters, e.g. { Color: 'Green' } or { Capacity: '8 kW' }
  opt?: Record<string, string>
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'title'
}
