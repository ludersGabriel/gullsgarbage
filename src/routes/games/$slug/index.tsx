import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { DevlogList } from '~/components/DevlogList'
import { GameEmbed } from '~/components/GameEmbed'
import { Gull } from '~/components/Gull'
import { Markdown } from '~/components/Markdown'
import { StatusBadge } from '~/components/StatusBadge'
import type { Game } from '~/content/schema'
import { formatDate } from '~/lib/date'
import { fetchDevlogs, fetchGame } from '~/server/functions'

export const Route = createFileRoute('/games/$slug/')({
  ssr: true,
  loader: async ({ params }) => {
    const game = await fetchGame({ data: { slug: params.slug } })
    if (!game) throw notFound()
    const devlogs = await fetchDevlogs({ data: { slug: params.slug } })
    return { game, devlogs }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.game.title ?? 'Game'} — gullsgabage` },
      { name: 'description', content: loaderData?.game.tagline ?? '' },
    ],
  }),
  component: GamePage,
})

function GamePage() {
  const { game, devlogs } = Route.useLoaderData()

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link to="/games" className="text-sm font-semibold text-sky-700 hover:text-sky-900">
        ← all games
      </Link>

      <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
        <div className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-sky-900/10 bg-gradient-to-br from-sky-200 to-amber-100">
          {game.cover ? (
            <img
              src={game.cover}
              alt={`${game.title} cover`}
              className="h-full w-full object-cover"
            />
          ) : (
            <Gull className="h-16 w-40 text-sky-900/30" />
          )}
        </div>

        <div>
          <StatusBadge status={game.status} />
          <h1 className="font-display mt-3 text-4xl font-black tracking-tight">{game.title}</h1>
          {game.tagline ? <p className="mt-2 text-lg text-sky-900/70">{game.tagline}</p> : null}

          <dl className="mt-6 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {game.jam ? <Meta label="Jam" value={game.jam} /> : null}
            {game.releasedAt ? <Meta label="Released" value={formatDate(game.releasedAt)} /> : null}
            {game.updatedAt ? <Meta label="Updated" value={formatDate(game.updatedAt)} /> : null}
          </dl>

          {game.tags.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {game.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-sky-900/5 px-3 py-1 text-xs font-semibold text-sky-900/70"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          {game.links.length ? (
            <div className="mt-5 flex flex-wrap gap-3">
              {game.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-sky-900/15 px-4 py-2 text-sm font-semibold text-sky-900 transition hover:border-sky-900/30 hover:bg-sky-900/5"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-black tracking-tight">Play</h2>
        <div className="mt-4">
          <PlaySection game={game} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-black tracking-tight">About</h2>
        <div className="mt-4">
          <Markdown html={game.html} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-black tracking-tight">Devlog</h2>
        <div className="mt-4">
          <DevlogList items={devlogs} />
        </div>
      </section>
    </main>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-sky-900/50 uppercase">{label}</dt>
      <dd className="mt-0.5 font-medium text-sky-950">{value}</dd>
    </div>
  )
}

function PlaySection({ game }: { game: Game }) {
  if (game.play?.kind === 'embedded') {
    return <GameEmbed src={`/play/${game.slug}/`} title={game.title} />
  }

  if (game.play?.kind === 'external') {
    return (
      <a
        href={game.play.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-sky-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-900/20 transition hover:bg-sky-800"
      >
        Play {game.title} ↗
      </a>
    )
  }

  return (
    <p className="rounded-xl border border-dashed border-sky-900/20 bg-white/50 p-6 text-sm text-sky-900/60">
      This one isn&apos;t playable in the browser yet. Check back soon.
    </p>
  )
}
