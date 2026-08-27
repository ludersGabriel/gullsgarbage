import { useRef } from 'react'

export function GameEmbed({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null)

  return (
    <div className="overflow-hidden rounded-2xl border border-sky-900/15 bg-slate-950 shadow-lg shadow-sky-900/10">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-slate-900 px-4 py-2.5">
        <p className="truncate text-xs font-semibold tracking-wide text-sky-100/70 uppercase">
          Play {title}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-sky-100/80 transition hover:bg-white/10 hover:text-white"
          >
            Open in new tab ↗
          </a>
          <button
            type="button"
            onClick={() => ref.current?.requestFullscreen?.()}
            className="rounded-full bg-sky-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-sky-400"
          >
            Fullscreen ⤢
          </button>
        </div>
      </div>
      <iframe
        ref={ref}
        src={src}
        title={`Play ${title}`}
        allow="autoplay; fullscreen; gamepad; clipboard-write"
        allowFullScreen
        loading="lazy"
        className="block aspect-video w-full"
      />
    </div>
  )
}
