import { Link } from '@tanstack/react-router'
import type { ProductCard as Card } from '~/lib/types'
import { formatMoney, shopifyImage } from '~/lib/catalog'

export function ProductCard({ product, priority = false }: { product: Card; priority?: boolean }) {
  const { minVariantPrice, maxVariantPrice } = product.priceRange
  const from = minVariantPrice.amount !== maxVariantPrice.amount
  const img = product.featuredImage
  return (
    <Link to="/products/$handle" params={{ handle: product.handle }} className="group block">
      <div className="aspect-square overflow-hidden rounded-xl bg-white">
        {img && (
          <img
            src={shopifyImage(img.url, 600)}
            srcSet={[300, 600, 900].map((w) => `${shopifyImage(img.url, w)} ${w}w`).join(', ')}
            sizes="(min-width: 1024px) 25vw, 50vw"
            width={600}
            height={600}
            alt={img.altText ?? product.title}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium">{product.title}</h3>
        <p className="whitespace-nowrap text-sm">
          {from && <span className="text-muted">from </span>}
          {formatMoney(minVariantPrice)}
        </p>
      </div>
      {!product.availableForSale && <p className="mt-1 text-xs text-muted">Sold out</p>}
    </Link>
  )
}
