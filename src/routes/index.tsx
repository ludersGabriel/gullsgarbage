import { createFileRoute } from '@tanstack/react-router'
import gullblock from '~/resources/gullblock.png'
import { GameCard } from '~/components/GameCard'
import { fetchGames } from '~/server/functions'

export const Route = createFileRoute('/')({
  ssr: true,
  head: () => ({
    meta: [{ title: 'gullsgabage — coming soon' }],
  }),
  loader: async () => ({ games: await fetchGames() }),
  component: HomePage,
})

function HomePage() {
  const { games } = Route.useLoaderData()

  return (
    <main>
      <section className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-300 via-sky-100 to-amber-100 px-6 text-center text-sky-950">
        <img
          src={gullblock}
          alt="gullblock"
          className="h-48 w-auto drop-shadow-md [image-rendering:pixelated]"
        />
        <p className="shine-text mt-6 text-3xl font-black tracking-[0.2em] uppercase">
          coming soon
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {games.length === 0 ? (
          <p className="text-sm text-sky-900/60">
            No games yet — run <code>bun scripts/new-game.ts &lt;slug&gt; "Title"</code> to add one.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
