import { Link } from '@tanstack/react-router'

export function Header({ nav, cartCount }: { nav: { handle: string; title: string }[]; cartCount: number }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Northwind<span className="text-brand"> Supply</span>
        </Link>
        <nav aria-label="Collections" className="hidden flex-1 gap-5 text-sm text-muted md:flex">
          {nav.slice(0, 6).map((c) => (
            <Link
              key={c.handle}
              to="/collections/$handle"
              params={{ handle: c.handle }}
              className="hover:text-ink"
              activeProps={{ className: 'text-ink font-medium' }}
            >
              {c.title}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4 text-sm">
          <Link to="/quote" className="hidden rounded-full border border-ink px-4 py-1.5 hover:bg-ink hover:text-paper sm:inline-block">
            Get a quote
          </Link>
          <Link to="/cart" className="relative font-medium" aria-label={`Cart, ${cartCount} items`}>
            Cart
            <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs text-white">
              {cartCount}
            </span>
          </Link>
        </div>
      </div>
      <nav aria-label="Collections" className="flex gap-4 overflow-x-auto px-4 pb-3 text-sm text-muted md:hidden">
        {nav.slice(0, 6).map((c) => (
          <Link key={c.handle} to="/collections/$handle" params={{ handle: c.handle }} className="whitespace-nowrap">
            {c.title}
          </Link>
        ))}
      </nav>
    </header>
  )
}
