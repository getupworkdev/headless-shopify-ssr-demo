/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import appCss from '../styles.css?url'
import { getCart, getNav } from '~/lib/server'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'

export const Route = createRootRoute({
  loader: async () => {
    const [nav, cart] = await Promise.all([getNav(), getCart()])
    return { nav, cartCount: cart?.totalQuantity ?? 0 }
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Northwind Supply' },
      { name: 'theme-color', content: '#1f5c4a' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootLayout() {
  const { nav, cartCount } = Route.useLoaderData()
  return (
    <div className="flex min-h-screen flex-col">
      <Header nav={nav} cartCount={cartCount} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
