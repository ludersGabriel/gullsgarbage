import { createFileRoute } from '@tanstack/react-router'
import gullblock from '~/resources/gullblock.png'

export const Route = createFileRoute('/')({
  ssr: true,
  head: () => ({
    meta: [{ title: 'gullsgabage — coming soon' }],
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <main className="flex h-screen flex-col items-center justify-center bg-black px-6 text-center">
      <img src={gullblock} alt="gullblock" className="h-48 w-auto [image-rendering:pixelated]" />
      <p className="shine-text mt-6 text-3xl font-black tracking-[0.2em] uppercase">coming soon</p>
    </main>
  )
}
