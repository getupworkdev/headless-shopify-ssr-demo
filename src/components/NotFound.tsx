import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-muted">The product or page you are looking for does not exist.</p>
      <Link to="/" className="mt-6 inline-block rounded-full bg-ink px-5 py-2 text-paper">
        Back to the shop
      </Link>
    </div>
  )
}
