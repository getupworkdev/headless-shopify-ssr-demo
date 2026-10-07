import { createFileRoute } from '@tanstack/react-router'
import { siteUrl } from '~/lib/shopify'
import { PROPERTY_TYPES, QUOTE_ERROR_TEXT } from '~/lib/quote'

type Search = Partial<Record<'sent' | 'error' | 'name' | 'contact' | 'postcode' | 'property' | 'message', string | number>>

export const Route = createFileRoute('/quote')({
  validateSearch: (s: Record<string, unknown>): Search =>
    Object.fromEntries(Object.entries(s).filter((e) => typeof e[1] === 'string' || typeof e[1] === 'number')) as Search,
  head: () => ({
    meta: [
      { title: 'Request a quote | Northwind Supply' },
      { name: 'description', content: 'Tell us about your property and we will send a tailored quote.' },
    ],
    links: [{ rel: 'canonical', href: siteUrl('/quote') }],
  }),
  component: QuotePage,
})

function QuotePage() {
  const s = Route.useSearch()
  const errors = new Set(String(s.error ?? '').split(',').filter(Boolean))
  if (String(s.sent) === '1') {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold">Thank you</h1>
        <p className="mt-3 text-muted">Your request has been received. We will reply within one working day.</p>
      </div>
    )
  }
  const field = 'mt-1 w-full rounded-lg border bg-white px-3 py-2'
  const cls = (k: string) => `${field} ${errors.has(k) ? 'border-red-600' : 'border-line'}`
  const err = (k: string) => errors.has(k) && <p className="mt-1 text-sm text-red-700">{QUOTE_ERROR_TEXT[k]}</p>
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Request a quote</h1>
      <p className="mt-2 text-muted">Tell us about your property. Validation runs on the server, so this form also works without JavaScript.</p>
      <form method="post" action="/api/quote" className="mt-8 space-y-5" noValidate>
        <label className="block text-sm font-medium">
          Name
          <input name="name" defaultValue={s.name} autoComplete="name" className={cls('name')} />
          {err('name')}
        </label>
        <label className="block text-sm font-medium">
          Email or phone
          <input name="contact" defaultValue={s.contact} autoComplete="email" className={cls('contact')} />
          {err('contact')}
        </label>
        <label className="block text-sm font-medium">
          Postcode
          <input name="postcode" defaultValue={s.postcode} inputMode="numeric" placeholder="114 35" className={cls('postcode')} />
          {err('postcode')}
        </label>
        <label className="block text-sm font-medium">
          Property type
          <select name="property" defaultValue={s.property ?? ''} className={cls('property')}>
            <option value="" disabled>Choose…</option>
            {PROPERTY_TYPES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          {err('property')}
        </label>
        <label className="block text-sm font-medium">
          Message <span className="font-normal text-muted">(optional)</span>
          <textarea name="message" rows={4} defaultValue={s.message} className={`${field} border-line`} />
        </label>
        <button className="w-full rounded-full bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark">Send request</button>
      </form>
    </div>
  )
}
