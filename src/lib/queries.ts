const IMAGE = `url altText width height`
const MONEY = `amount currencyCode`

export const PRODUCT_CARD = `
  id handle title availableForSale tags
  featuredImage { ${IMAGE} }
  priceRange { minVariantPrice { ${MONEY} } maxVariantPrice { ${MONEY} } }
  options { name optionValues { name } }
`

export const HOME_QUERY = `
  query Home {
    featured: collection(handle: "featured") { title products(first: 8) { nodes { ${PRODUCT_CARD} } } }
    collections(first: 8) { nodes { handle title image { ${IMAGE} } } }
  }
`

export const COLLECTIONS_QUERY = `
  query Collections { collections(first: 50) { nodes { handle title } } }
`

// Storefront API `filters:` needs the Search & Discovery app on a real store.
// The demo store has none, so filtering happens on the server after this query.
export const COLLECTION_QUERY = `
  query Collection($handle: String!) {
    collection(handle: $handle) {
      handle title description
      seo { title description }
      image { ${IMAGE} }
      products(first: 100) { nodes { ${PRODUCT_CARD} } }
    }
  }
`

export const PRODUCT_QUERY = `
  query Product($handle: String!) {
    product(handle: $handle) {
      id handle title description descriptionHtml vendor tags
      seo { title description }
      images(first: 10) { nodes { ${IMAGE} } }
      options { name optionValues { name } }
      variants(first: 100) {
        nodes {
          id title availableForSale sku
          price { ${MONEY} }
          compareAtPrice { ${MONEY} }
          image { ${IMAGE} }
          selectedOptions { name value }
        }
      }
      collections(first: 3) { nodes { handle title } }
    }
  }
`

export const SITEMAP_QUERY = `
  query Sitemap {
    products(first: 250) { nodes { handle updatedAt } }
    collections(first: 250) { nodes { handle updatedAt } }
  }
`

const CART = `
  id checkoutUrl totalQuantity
  cost { subtotalAmount { ${MONEY} } totalAmount { ${MONEY} } }
  lines(first: 100) {
    nodes {
      id quantity
      cost { totalAmount { ${MONEY} } }
      merchandise {
        ... on ProductVariant {
          id title image { ${IMAGE} } selectedOptions { name value }
          product { handle title }
        }
      }
    }
  }
`

export const CART_QUERY = `query Cart($id: ID!) { cart(id: $id) { ${CART} } }`

export const CART_CREATE = `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) { cart { ${CART} } userErrors { message } }
  }
`

export const CART_LINES_ADD = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ${CART} } userErrors { message } }
  }
`

export const CART_LINES_UPDATE = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ${CART} } userErrors { message } }
  }
`

export const CART_LINES_REMOVE = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ${CART} } userErrors { message } }
  }
`
