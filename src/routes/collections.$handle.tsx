import { Link, createFileRoute } from '@tanstack/react-router'
import { getCollection } from '~/lib/server'
import { absolute, originFrom } from '~/lib/site'
import { ProductCard } from '~/components/ProductCard'
import type { CollectionFilters } from '~/lib/types'

type Search = Record<string, string | number>

export const Route = createFileRoute('/collections/$handle')({
  // Every filter lives in the URL, so a filtered page is a normal server-rendered GET.
  validateSearch: (search: Record<string, unknown>): Search =>
    Object.fromEntries(
      Object.entries(search).filter((e): e is [string, string | number] => typeof e[1] === 'string' || typeof e[1] === 'number'),
    ),
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ params, deps }) => getCollection({ data: { handle: params.handle, search: deps.search } }),
  head: ({ loaderData, params, matches }) => {
    const siteUrl = (path: string) => absolute(originFrom(matches), path)
    if (!loaderData) return {}
    const { collection, products } = loaderData
    const title = collection.seo.title || `${collection.title} | Northwind Supply`
    const description = collection.seo.description || collection.description || `Shop ${collection.title}.`
    const url = siteUrl(`/collections/${params.handle}`)
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:url', content: url },
      ],
      // Filtered variants of a collection all canonicalise to the plain collection URL.
      links: [{ rel: 'canonical', href: url }],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl('/') },
                  { '@type': 'ListItem', position: 2, name: collection.title, item: url },
                ],
              },
              {
                '@type': 'ItemList',
                itemListElement: products.map((p, i) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  url: siteUrl(`/products/${p.handle}`),
                  name: p.title,
                })),
              },
            ],
          }),
        },
      ],
    }
  },
  component: CollectionPage,
})

function CollectionPage() {
  const { collection, products, total, filters, facets } = Route.useLoaderData()
  const { handle } = Route.useParams()
  const active = activeChips(filters)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link to="/" className="hover:text-ink">Home</Link> / <span className="text-ink">{collection.title}</span>
      </nav>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{collection.title}</h1>
      {collection.description && <p className="mt-2 max-w-2xl text-muted">{collection.description}</p>}

      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        {/* A plain GET form: works without JavaScript and produces a shareable, crawlable URL. */}
        <form method="get" action={`/collections/${handle}`} className="space-y-6 text-sm" aria-label="Filters">
          <fieldset>
            <legend className="font-medium">Availability</legend>
            <label className="mt-2 flex items-center gap-2">
              <input type="checkbox" name="inStock" value="1" defaultChecked={!!filters.inStock} /> In stock only
            </label>
          </fieldset>
          <fieldset>
            <legend className="font-medium">Price</legend>
            <div className="mt-2 flex items-center gap-2">
              <input name="min" inputMode="numeric" placeholder="Min" defaultValue={filters.min ?? ''} className="w-20 rounded-md border border-line bg-white px-2 py-1.5" aria-label="Minimum price" />
              <span>to</span>
              <input name="max" inputMode="numeric" placeholder="Max" defaultValue={filters.max ?? ''} className="w-20 rounded-md border border-line bg-white px-2 py-1.5" aria-label="Maximum price" />
            </div>
          </fieldset>
          {facets.options.map((o) => (
            <fieldset key={o.name}>
              <legend className="font-medium">{o.name}</legend>
              <select name={`opt.${o.name}`} defaultValue={filters.opt?.[o.name] ?? ''} className="mt-2 w-full rounded-md border border-line bg-white px-2 py-1.5">
                <option value="">Any</option>
                {o.values.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </fieldset>
          ))}
          <fieldset>
            <legend className="font-medium">Sort</legend>
            <select name="sort" defaultValue={filters.sort ?? 'featured'} className="mt-2 w-full rounded-md border border-line bg-white px-2 py-1.5">
              <option value="featured">Featured</option>
              <option value="price-asc">Price, low to high</option>
              <option value="price-desc">Price, high to low</option>
              <option value="title">Name</option>
            </select>
          </fieldset>
          <div className="flex gap-2">
            <button className="rounded-full bg-ink px-5 py-2 text-paper">Apply</button>
            {active.length > 0 && (
              <a href={`/collections/${handle}`} className="rounded-full border border-line px-5 py-2">Clear</a>
            )}
          </div>
        </form>

        <section aria-label="Products">
          <p className="text-sm text-muted">
            {products.length} of {total} products
            {active.length > 0 && <> · {active.join(' · ')}</>}
          </p>
          {products.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-line p-10 text-center text-muted">
              No products match these filters.
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 3} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function activeChips(f: CollectionFilters) {
  const out: string[] = []
  if (f.inStock) out.push('In stock')
  if (f.min !== undefined || f.max !== undefined) out.push(`Price ${f.min ?? 0}–${f.max ?? '∞'}`)
  if (f.tag) out.push(f.tag)
  for (const [k, v] of Object.entries(f.opt ?? {})) out.push(`${k}: ${v}`)
  return out
}
