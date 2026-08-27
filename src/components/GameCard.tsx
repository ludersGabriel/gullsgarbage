import { Link } from '@tanstack/react-router'
import type { GameSummary } from '~/content/schema'
import { Gull } from './Gull'
import { StatusBadge } from './StatusBadge'

export function GameCard({ game }: { game: GameSummary }) {
  return (
    <Link
      to="/games/$slug"
      params={{ slug: game.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-sky-900/10 bg-white/70 shadow-sm shadow-sky-900/5 transition hover:-translate-y-0.5 hover:border-sky-900/20 hover:shadow-md hover:shadow-sky-900/10 focus-visible:ring-2 focus-visible:ring-sky-900 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <div className="flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-br from-sky-200 to-amber-100">
        {game.cover ? (
          <img
            src={game.cover}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Gull className="h-10 w-24 text-sky-900/30" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl leading-tight font-black tracking-tight text-sky-950">
            {game.title}
          </h3>
          <StatusBadge status={game.status} />
        </div>
        {game.tagline ? <p className="text-sm text-sky-900/70">{game.tagline}</p> : null}
        {game.jam ? (
          <p className="mt-auto pt-1 text-[11px] font-bold tracking-[0.2em] text-sky-900/50 uppercase">
            {game.jam}
          </p>
        ) : null}
      </div>
    </Link>
  )
}
