import { createRootRoute, HeadContent, Link, Outlet, Scripts } from '@tanstack/react-router'
import { Gull } from '~/components/Gull'
import '../styles.css'

const GULL_FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 64'%3E%3Cpath fill='%23ffffff' d='M60 42 Q30 10 8 14 Q26 26 44 34 Q44 42 60 46 Q76 42 76 34 Q94 26 112 14 Q90 10 60 42 Z'/%3E%3C/svg%3E"

/**
 * Root route — renders the FULL document: <html>, <head> (via HeadContent)
 * and <body> (via Outlet + Scripts). This is what makes SSR
 * "full-document": the server response is a complete HTML page.
 */
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'gullsgabage — coming soon' },
    ],
    links: [{ rel: 'icon', href: GULL_FAVICON }],
  }),
  // Custom 404 instead of TanStack Router's generic <p>Not Found</p>.
  notFoundComponent: NotFoundPage,
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-black text-white antialiased">
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}

function NotFoundPage() {
  return (
    <main className="flex h-screen flex-col items-center justify-center bg-black px-6 text-center">
      <Gull className="h-10 w-24 -rotate-6 text-white/40" />
      <p className="mt-6 text-[11px] font-bold tracking-[0.3em] text-white/50 uppercase">
        404 · nothing but gulls here
      </p>
      <Link
        to="/"
        className="mt-8 rounded-full border border-white/25 px-6 py-2.5 text-sm font-bold tracking-wide text-white transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
      >
        ← back to shore
      </Link>
    </main>
  )
}
