import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { Markdown } from '~/components/Markdown'
import { formatDate } from '~/lib/date'
import { fetchDevlog, fetchGameSummary } from '~/server/functions'

export const Route = createFileRoute('/games/$slug/devlog/$post')({
  ssr: true,
  loader: async ({ params }) => {
    const [game, post] = await Promise.all([
      fetchGameSummary({ data: { slug: params.slug } }),
      fetchDevlog({ data: { slug: params.slug, post: params.post } }),
    ])
    if (!game || !post) throw notFound()
    return { game, post }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.post.title ?? 'Devlog'} — ${loaderData?.game.title ?? 'Game'} — gullsgabage`,
      },
    ],
  }),
  component: DevlogPostPage,
})

function DevlogPostPage() {
  const { game, post } = Route.useLoaderData()

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        to="/games/$slug/devlog"
        params={{ slug: game.slug }}
        className="text-sm font-semibold text-sky-700 hover:text-sky-900"
      >
        ← {game.title} devlog
      </Link>

      <article className="mt-6">
        <time
          dateTime={post.date}
          className="text-xs font-semibold tracking-wide text-sky-900/50 uppercase"
        >
          {formatDate(post.date)}
        </time>
        <h1 className="font-display mt-2 text-4xl leading-tight font-black tracking-tight">
          {post.title}
        </h1>
        {post.build ? (
          <span className="mt-3 inline-block rounded-full bg-sky-900/10 px-3 py-1 text-xs font-bold text-sky-900/70">
            {post.build}
          </span>
        ) : null}
        <div className="mt-8">
          <Markdown html={post.html} />
        </div>
      </article>

      <footer className="mt-12 flex justify-between border-t border-sky-900/10 pt-6">
        <Link
          to="/games/$slug"
          params={{ slug: game.slug }}
          className="text-sm font-semibold text-sky-700 hover:text-sky-900"
        >
          ← {game.title}
        </Link>
      </footer>
    </main>
  )
}
