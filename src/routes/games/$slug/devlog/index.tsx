import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { DevlogList } from '~/components/DevlogList'
import { fetchDevlogs, fetchGameSummary } from '~/server/functions'

export const Route = createFileRoute('/games/$slug/devlog/')({
  ssr: true,
  loader: async ({ params }) => {
    const game = await fetchGameSummary({ data: { slug: params.slug } })
    if (!game) throw notFound()
    const devlogs = await fetchDevlogs({ data: { slug: params.slug } })
    return { game, devlogs }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `Devlog — ${loaderData?.game.title ?? 'Game'} — gullsgabage` }],
  }),
  component: DevlogIndexPage,
})

function DevlogIndexPage() {
  const { game, devlogs } = Route.useLoaderData()

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        to="/games/$slug"
        params={{ slug: game.slug }}
        className="text-sm font-semibold text-sky-700 hover:text-sky-900"
      >
        ← {game.title}
      </Link>
      <h1 className="font-display mt-4 text-3xl font-black tracking-tight">Devlog</h1>
      <p className="mt-1 text-sky-900/70">Build logs for {game.title}.</p>
      <div className="mt-6">
        <DevlogList items={devlogs} />
      </div>
    </main>
  )
}
