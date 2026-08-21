import { createFileRoute } from '@tanstack/react-router'
import gullblock from '~/resources/gullblock.png'

export const Route = createFileRoute('/')({
  // SSR mode per route: full server rendering.
  ssr: true,
  head: () => ({
    meta: [{ title: 'gullsgabage — coming soon' }],
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <main className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-300 via-sky-100 to-amber-100 px-6 text-center text-sky-950">
      <img
        src={gullblock}
        alt="gullblock"
        className="h-48 w-auto drop-shadow-md [image-rendering:pixelated]"
      />
      <p className="shine-text mt-6 text-3xl font-black tracking-[0.2em] uppercase">coming soon</p>
    </main>
  )
}
