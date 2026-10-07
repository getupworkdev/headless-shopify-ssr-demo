import { Link, createFileRoute } from '@tanstack/react-router'
import { getProduct } from '~/lib/server'
import { absolute, originFrom } from '~/lib/site'
import { formatMoney, numericId, selectVariant, shopifyImage, variantForOption } from '~/lib/catalog'
import type { Product, Variant } from '~/lib/types'

export const Route = createFileRoute('/products/$handle')({
  // The selected variant is in the URL (?variant=…), so each variant has its own server-rendered page.
  validateSearch: (search: Record<string, unknown>): { variant?: number | string; added?: number } => ({
    variant: typeof search.variant === 'string' || typeof search.variant === 'number' ? search.variant : undefined,
    added: search.added === '1' || search.added === 1 ? 1 : undefined,
  }),
  loaderDeps: ({ search }) => ({ variant: search.variant }),
  loader: async ({ params, deps }) => {
    const product = await getProduct({ data: params.handle })
    const selected = selectVariant(product.variants, { variant: deps.variant })
    return { product, selectedId: selected?.id }
  },
  head: ({ loaderData, params, matches }) => {
    const siteUrl = (path: string) => absolute(originFrom(matches), path)
    if (!loaderData) return {}
    const { product } = loaderData
    const url = siteUrl(`/products/${params.handle}`)
    const title = product.seo.title || `${product.title} | Northwind Supply`
    const description = (product.seo.description || product.description).slice(0, 160)
    const image = product.images[0]?.url
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:type', content: 'product' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: url },
        ...(image ? [{ property: 'og:image', content: shopifyImage(image, 1200) }] : []),
      ],
      links: [{ rel: 'canonical', href: url }],
      scripts: [{ type: 'application/ld+json', children: JSON.stringify(productJsonLd(product, url, siteUrl)) }],
    }
  },
  component: ProductPage,
})

function productJsonLd(product: Product, url: string, siteUrl: (path: string) => string) {
  const crumb = product.collections[0]
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProductGroup',
        name: product.title,
        description: product.description,
        url,
        brand: { '@type': 'Brand', name: product.vendor },
        productGroupID: numericId(product.id),
        variesBy: product.options.filter((o) => o.name !== 'Title').map((o) => o.name),
        image: product.images.map((i) => i.url),
        hasVariant: product.variants.map((v) => ({
          '@type': 'Product',
          name: `${product.title} – ${v.title}`,
          sku: v.sku || numericId(v.id),
          image: v.image?.url,
          url: `${url}?variant=${numericId(v.id)}`,
          ...Object.fromEntries(v.selectedOptions.map((o) => [o.name.toLowerCase(), o.value])),
          offers: {
            '@type': 'Offer',
            url: `${url}?variant=${numericId(v.id)}`,
            price: v.price.amount,
            priceCurrency: v.price.currencyCode,
            availability: v.availableForSale ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl('/') },
          ...(crumb ? [{ '@type': 'ListItem', position: 2, name: crumb.title, item: siteUrl(`/collections/${crumb.handle}`) }] : []),
          { '@type': 'ListItem', position: crumb ? 3 : 2, name: product.title, item: url },
        ],
      },
    ],
  }
}

function ProductPage() {
  const { product, selectedId } = Route.useLoaderData()
  const { added } = Route.useSearch()
  const variant = product.variants.find((v) => v.id === selectedId)
  const crumb = product.collections[0]
  const images = variant?.image ? [variant.image, ...product.images.filter((i) => i.url !== variant.image?.url)] : product.images
  const main = images[0]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link to="/" className="hover:text-ink">Home</Link>
        {crumb && (
          <>
            {' / '}
            <Link to="/collections/$handle" params={{ handle: crumb.handle }} className="hover:text-ink">{crumb.title}</Link>
          </>
        )}
        {' / '}<span className="text-ink">{product.title}</span>
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div>
          {main && (
            <img
              src={shopifyImage(main.url, 1000)}
              srcSet={[500, 800, 1200].map((w) => `${shopifyImage(main.url, w)} ${w}w`).join(', ')}
              sizes="(min-width: 768px) 50vw, 100vw"
              width={1000}
              height={1000}
              alt={main.altText ?? product.title}
              fetchPriority="high"
              className="aspect-square w-full rounded-2xl bg-white object-cover"
            />
          )}
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.slice(1, 6).map((img) => (
                <img key={img.url} src={shopifyImage(img.url, 200)} width={200} height={200} alt={img.altText ?? ''} loading="lazy" className="aspect-square rounded-lg bg-white object-cover" />
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-muted">{product.vendor}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{product.title}</h1>
          {variant && <PriceBlock variant={variant} />}

          {variant && <VariantPicker product={product} current={variant} />}

          {added && (
            <p role="status" className="mt-6 rounded-lg bg-[#e7f1ec] px-4 py-3 text-sm text-brand-dark">
              Added to cart. <Link to="/cart" className="font-medium underline">View cart</Link>
            </p>
          )}

          {/* Plain HTML form posting to a server route: works with JavaScript disabled. */}
          {variant && (
            <form method="post" action="/api/cart/add" className="mt-6 flex gap-3">
              <input type="hidden" name="merchandiseId" value={variant.id} />
              <input type="hidden" name="redirect" value={`/products/${product.handle}?variant=${numericId(variant.id)}&added=1`} />
              <label className="sr-only" htmlFor="qty">Quantity</label>
              <input id="qty" name="quantity" type="number" min={1} max={99} defaultValue={1} className="w-20 rounded-full border border-line bg-white px-4 py-3 text-center" />
              <button
                disabled={!variant.availableForSale}
                className="flex-1 rounded-full bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-muted"
              >
                {variant.availableForSale ? 'Add to cart' : 'Sold out'}
              </button>
            </form>
          )}

          <div className="prose mt-8 max-w-none text-sm leading-relaxed text-muted" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
        </div>
      </div>
    </div>
  )
}

function PriceBlock({ variant }: { variant: Variant }) {
  const onSale = variant.compareAtPrice && Number(variant.compareAtPrice.amount) > Number(variant.price.amount)
  return (
    <p className="mt-4 text-2xl">
      {formatMoney(variant.price)}
      {onSale && variant.compareAtPrice && (
        <span className="ml-3 text-base text-muted line-through">{formatMoney(variant.compareAtPrice)}</span>
      )}
      <span className="ml-3 align-middle text-sm text-muted">{variant.availableForSale ? 'In stock' : 'Sold out'}</span>
    </p>
  )
}

// Each option value is a real link to the matching variant's URL: crawlable, shareable, no JavaScript needed.
function VariantPicker({ product, current }: { product: Product; current: Variant }) {
  const options = product.options.filter((o) => !(o.name === 'Title' && o.optionValues.length === 1))
  if (options.length === 0) return null
  return (
    <div className="mt-6 space-y-5">
      {options.map((o) => {
        const selected = current.selectedOptions.find((s) => s.name === o.name)?.value
        return (
          <fieldset key={o.name}>
            <legend className="text-sm font-medium">
              {o.name}: <span className="font-normal text-muted">{selected}</span>
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {o.optionValues.map(({ name: value }) => {
                const target = variantForOption(product.variants, current, o.name, value)
                const isSelected = value === selected
                if (!target) {
                  return (
                    <span key={value} className="rounded-full border border-dashed border-line px-4 py-2 text-sm text-muted line-through">
                      {value}
                    </span>
                  )
                }
                return (
                  <Link
                    key={value}
                    to="/products/$handle"
                    params={{ handle: product.handle }}
                    search={{ variant: Number(numericId(target.id)) }}
                    replace
                    resetScroll={false}
                    aria-current={isSelected ? 'true' : undefined}
                    className={`rounded-full border px-4 py-2 text-sm ${
                      isSelected ? 'border-ink bg-ink text-paper' : 'border-line bg-white hover:border-ink'
                    } ${target.availableForSale ? '' : 'opacity-50'}`}
                  >
                    {value}
                  </Link>
                )
              })}
            </div>
          </fieldset>
        )
      })}
    </div>
  )
}
