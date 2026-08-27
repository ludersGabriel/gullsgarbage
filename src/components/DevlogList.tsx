import { Link } from '@tanstack/react-router'
import type { DevlogPostSummary } from '~/content/schema'
import { formatDate } from '~/lib/date'

export type DevlogListItem = DevlogPostSummary & { gameTitle?: string }

export function DevlogList({ items }: { items: DevlogListItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-sky-900/60">No devlogs yet.</p>
  }

  return (
    <ol className="divide-y divide-sky-900/10">
      {items.map((post) => (
        <li key={`${post.gameSlug}/${post.slug}`}>
          <Link
            to="/games/$slug/devlog/$post"
            params={{ slug: post.gameSlug, post: post.slug }}
            className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6"
          >
            <time
              dateTime={post.date}
              className="w-28 shrink-0 text-xs font-semibold tracking-wide text-sky-900/50 uppercase"
            >
              {formatDate(post.date)}
            </time>
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2">
                {post.gameTitle ? (
                  <span className="text-xs font-bold tracking-wide text-sky-700/70 uppercase">
                    {post.gameTitle}
                  </span>
                ) : null}
                {post.build ? (
                  <span className="rounded-full bg-sky-900/10 px-2 py-0.5 text-[11px] font-bold text-sky-900/70">
                    {post.build}
                  </span>
                ) : null}
              </p>
              <h3 className="font-display text-lg leading-snug font-black tracking-tight text-sky-950 group-hover:text-sky-700">
                {post.title}
              </h3>
              {post.summary ? <p className="mt-1 text-sm text-sky-900/70">{post.summary}</p> : null}
            </div>
          </Link>
        </li>
      ))}
    </ol>
  )
}
