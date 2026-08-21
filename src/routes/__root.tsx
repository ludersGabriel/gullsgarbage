import { createRootRoute, HeadContent, Link, Outlet, Scripts } from '@tanstack/react-router'
import { Gull, Waves } from '~/components/Gull'
import '../styles.css'

const GULL_FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 64'%3E%3Cpath fill='%230c4a6e' d='M60 42 Q30 10 8 14 Q26 26 44 34 Q44 42 60 46 Q76 42 76 34 Q94 26 112 14 Q90 10 60 42 Z'/%3E%3C/svg%3E"

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
      { title: 'gullsgabage — hello gulls' },
      {
        name: 'description',
        content:
          'a TanStack Start rookery: hello gulls, validated search params, typed server functions, streaming SSR',
      },
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
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}

function NotFoundPage() {
  return (
    <main className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-300 via-sky-100 to-amber-100 px-6 text-center text-sky-950">
      <Gull className="h-12 w-28 -rotate-6 text-sky-900/40" />
      <p className="mt-6 rounded-full border border-sky-900/20 bg-white/60 px-5 py-1.5 text-[11px] font-bold tracking-[0.3em] text-sky-900/70 uppercase backdrop-blur">
        404 · nothing but gulls here
      </p>
      <h1 className="font-display mt-6 text-6xl font-black tracking-tight italic">
        this page flew away
      </h1>
      <p className="mt-4 max-w-md text-sky-900/70">
        the shore is a single page. head back to hello gulls.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-sky-900 px-6 py-3 text-sm font-bold tracking-wide text-white shadow-lg shadow-sky-900/20 transition hover:bg-sky-800 hover:shadow-sky-900/30 focus-visible:ring-2 focus-visible:ring-sky-900 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-100 focus-visible:outline-none active:scale-95"
      >
        ← back to shore
      </Link>
      <Waves className="absolute right-0 bottom-0 left-0" />
    </main>
  )
}
