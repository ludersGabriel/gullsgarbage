import { createFileRoute } from '@tanstack/react-router'
import { GameCard } from '~/components/GameCard'
import { fetchGames } from '~/server/functions'

export const Route = createFileRoute('/games/')({
  ssr: true,
  head: () => ({
    meta: [{ title: 'Games — gullsgabage' }],
  }),
  loader: async () => ({ games: await fetchGames() }),
  component: GamesPage,
})

function GamesPage() {
  const { games } = Route.useLoaderData()

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-black tracking-tight">Games</h1>
      <p className="mt-2 text-sky-900/70">Everything from the nest.</p>
      {games.length === 0 ? (
        <p className="mt-10 text-sm text-sky-900/60">
          No games yet — run <code>bun scripts/new-game.ts &lt;slug&gt; "Title"</code> to add one.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      )}
    </main>
  )
}
