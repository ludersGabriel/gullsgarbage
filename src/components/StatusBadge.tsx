import type { GameStatus } from '~/content/schema'

const STYLES: Record<GameStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-slate-200 text-slate-700' },
  'in-development': { label: 'In development', className: 'bg-amber-200 text-amber-900' },
  playable: { label: 'Playable', className: 'bg-sky-200 text-sky-900' },
  released: { label: 'Released', className: 'bg-emerald-200 text-emerald-900' },
  archived: { label: 'Archived', className: 'bg-stone-200 text-stone-600' },
}

export function StatusBadge({ status }: { status: GameStatus }) {
  const style = STYLES[status]
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${style.className}`}
    >
      {style.label}
    </span>
  )
}
