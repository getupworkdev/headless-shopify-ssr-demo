// Storefront API client. Server-only: imported from server functions and server routes.
// With no SHOPIFY_STORE_DOMAIN set it talks to Shopify's public demo store (mock.shop).

const API_VERSION = '2025-07'

function endpoint() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim()
  if (!domain) return { url: 'https://mock.shop/api', token: undefined }
  return {
    url: `https://${domain}/api/${API_VERSION}/graphql.json`,
    token: process.env.SHOPIFY_STOREFRONT_TOKEN?.trim(),
  }
}

export class ShopifyError extends Error {}

export async function storefront<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const { url, token } = endpoint()
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { 'X-Shopify-Storefront-Access-Token': token } : {}),
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new ShopifyError(`Storefront API responded ${res.status}`)
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] }
  if (json.errors?.length) throw new ShopifyError(json.errors.map((e) => e.message).join('; '))
  if (!json.data) throw new ShopifyError('Storefront API returned no data')
  return json.data
}

export function siteUrl(path = '/') {
  const base = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
  return `${base}${path}`
}
