import { Link, createFileRoute } from '@tanstack/react-router'
import { getHome } from '~/lib/server'
import { siteUrl } from '~/lib/shopify'
import { ProductCard } from '~/components/ProductCard'
import { shopifyImage } from '~/lib/catalog'

export const Route = createFileRoute('/')({
  loader: () => getHome(),
  head: () => ({
    meta: [
      { title: 'Northwind Supply | Headless Shopify demo' },
      { name: 'description', content: 'A headless Shopify storefront rendered on the server with TanStack Start.' },
      { property: 'og:title', content: 'Northwind Supply' },
      { property: 'og:type', content: 'website' },
    ],
    links: [{ rel: 'canonical', href: siteUrl('/') }],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'Northwind Supply', url: siteUrl('/') }),
      },
    ],
  }),
  component: Home,
})

function Home() {
  const { featured, collections } = Route.useLoaderData()
  return (
    <>
      <section className="border-b border-line bg-[#eef1ec]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="self-center">
            <p className="text-sm font-medium uppercase tracking-widest text-brand">Server-rendered storefront</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Every product page arrives as complete HTML.
            </h1>
            <p className="mt-4 max-w-md text-muted">
              Products, prices and variants load from Shopify on the server, so customers, Google and AI crawlers all see the full page,
              even without JavaScript.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/collections/$handle" params={{ handle: 'featured' }} className="rounded-full bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-dark">
                Shop featured
              </Link>
              <Link to="/quote" className="rounded-full border border-ink px-6 py-3 text-sm font-medium hover:bg-ink hover:text-paper">
                Request a quote
              </Link>
            </div>
          </div>
          {featured[0]?.featuredImage && (
            <img
              src={shopifyImage(featured[0].featuredImage.url, 900)}
              width={900}
              height={900}
              alt={featured[0].title}
              fetchPriority="high"
              className="aspect-square w-full rounded-2xl object-cover"
            />
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Featured</h2>
          <Link to="/collections/$handle" params={{ handle: 'featured' }} className="text-sm text-brand hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Shop by collection</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {collections
            .filter((c) => c.handle !== 'featured')
            .map((c) => (
              <Link
                key={c.handle}
                to="/collections/$handle"
                params={{ handle: c.handle }}
                className="rounded-xl border border-line bg-white px-5 py-6 font-medium hover:border-brand"
              >
                {c.title}
              </Link>
            ))}
        </div>
      </section>
    </>
  )
}
