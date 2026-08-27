import { createFileRoute } from '@tanstack/react-router'
import { DevlogList, type DevlogListItem } from '~/components/DevlogList'
import { fetchAllDevlogs, fetchGames } from '~/server/functions'

export const Route = createFileRoute('/devlog')({
  ssr: true,
  head: () => ({
    meta: [{ title: 'Devlog — gullsgabage' }],
  }),
  loader: async () => {
    const [devlogs, games] = await Promise.all([fetchAllDevlogs(), fetchGames()])
    const titles = new Map(games.map((game) => [game.slug, game.title]))
    const items: DevlogListItem[] = devlogs.map((post) => ({
      ...post,
      gameTitle: titles.get(post.gameSlug) ?? post.gameSlug,
    }))
    return { items }
  },
  component: DevlogFeedPage,
})

function DevlogFeedPage() {
  const { items } = Route.useLoaderData()

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-black tracking-tight">Devlog</h1>
      <p className="mt-2 text-sky-900/70">Build logs from every game, newest first.</p>
      <div className="mt-8">
        {items.length === 0 ? (
          <p className="text-sm text-sky-900/60">
            No devlogs yet — run <code>bun scripts/new-devlog.ts &lt;slug&gt; "Title"</code> to
            write one.
          </p>
        ) : (
          <DevlogList items={items} />
        )}
      </div>
    </main>
  )
}
