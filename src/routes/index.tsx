import { createFileRoute } from '@tanstack/react-router'
import gullblock from '~/resources/gullblock.png'

export const Route = createFileRoute('/')({
  // SSR mode per route: full server rendering.
  ssr: true,
  head: () => ({
    meta: [{ title: 'gullsgabage — quack' }],
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
      <p className="mt-10 rounded-full border border-sky-900/20 bg-white/60 px-6 py-2 text-xs font-bold tracking-[0.35em] text-sky-900/70 uppercase backdrop-blur">
        coming soon
      </p>
      <p className="font-display mt-4 text-5xl font-black tracking-tight italic">quack</p>
    </main>
  )
}
