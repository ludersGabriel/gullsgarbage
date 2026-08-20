import { Await, createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { getGullReport, getTideReport } from '~/server/gulls.functions'
import { Gull, Waves } from '~/components/Gull'
import { SquawkButton } from '~/components/SquawkButton'

/**
 * Validated search params (zod v4 schema — Standard Schema compliant, so it
 * plugs straight into `validateSearch`). Every URL that touches this route
 * is parsed and coerced; invalid values fall back via `.catch()`.
 */
const gullSearchSchema = z.object({
  flock: z
    .string()
    .trim()
    .min(1, 'flock must not be empty')
    .max(40, 'flock is too long for one banner')
    .default('gulls')
    .catch('gulls'),
  squawks: z.coerce
    .number()
    .int('squawks must be a whole number')
    .min(0)
    .max(50, 'more than 50 squawks would wake the harbor master')
    .default(3)
    .catch(3),
})

export const Route = createFileRoute('/')({
  // SSR mode per route: full server rendering + streaming for the shore page.
  ssr: true,
  validateSearch: gullSearchSchema,
  // Only these params participate in the loader cache key.
  loaderDeps: ({ search }) => ({ flock: search.flock, squawks: search.squawks }),
  loader: async ({ deps }) => {
    // Fast, awaited — part of the first paint.
    const report = await getGullReport({
      data: { flock: deps.flock, squawks: deps.squawks },
    })
    // Slow, UNAWAITED — the stream handler flushes the shell, then this
    // tide report streams in and <Await> swaps it in.
    const tide = getTideReport({ data: { flock: deps.flock } })
    return { ...report, tide }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `hello ${loaderData?.flock ?? 'gulls'} · gullsgabage`,
      },
    ],
  }),
  component: HomePage,
})

function HomePage() {
  const { flock, squawks } = Route.useSearch()
  const report = Route.useLoaderData()
  const navigate = useNavigate()

  return (
    <main className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-300 via-sky-100 to-amber-100 px-6 text-center text-sky-950">
      {/* flying gulls */}
      <Gull className="absolute top-[12%] left-[10%] h-10 w-24 -rotate-6 text-sky-900/30" />
      <Gull className="absolute top-[16%] right-[10%] h-6 w-14 rotate-3 text-sky-900/25" />
      <Gull className="absolute top-[6%] left-[32%] h-5 w-12 rotate-12 text-sky-900/20" />
      <Gull className="absolute top-[38%] right-[22%] h-8 w-20 -rotate-12 text-sky-900/20" />

      <section className="relative z-10 flex w-full max-w-3xl flex-col items-center">
        <p className="rounded-full border border-sky-900/20 bg-white/60 px-5 py-1.5 text-[11px] font-bold tracking-[0.3em] text-sky-900/70 uppercase backdrop-blur">
          gullsgabage · a tanstack start rookery
        </p>

        <h1 className="font-display mt-6 text-6xl font-black tracking-tight italic drop-shadow-sm sm:text-7xl">
          hello <span className="text-amber-500">{report.flock}</span>
        </h1>

        <p className="mt-4 max-w-xl text-lg text-sky-900/70">
          {report.squawkCount === 0
            ? 'the flock is quiet so far — the button is right below.'
            : `${report.squawkCount} squawk${report.squawkCount === 1 ? '' : 's'} on record for this flock.`}{' '}
          gull of the day: <strong>{report.gullOfTheDay.name}</strong>.
        </p>

        {/* validated search param, rendered from the URL */}
        <div className="mt-4 flex max-w-2xl flex-wrap justify-center gap-2 overflow-hidden">
          {Array.from({ length: report.squawks }).map((_, i) => (
            <span
              key={i}
              className="rounded-full bg-sky-950/90 px-3 py-1 text-xs font-black tracking-widest text-amber-300 uppercase shadow-sm"
            >
              squawk!
            </span>
          ))}
          {report.squawks === 0 && (
            <span className="rounded-full border border-dashed border-sky-900/30 px-3 py-1 text-xs font-semibold text-sky-900/50">
              shhh… zero squawks requested
            </span>
          )}
        </div>

        {/* search params are writable too — this navigate is fully typed */}
        <form
          className="mt-5 flex w-full max-w-md gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const next = new FormData(e.currentTarget).get('flock')?.toString() ?? ''
            void navigate({ to: '/', search: { flock: next, squawks } })
          }}
        >
          <input
            name="flock"
            defaultValue={flock}
            placeholder="flock name (try: pier pirates)"
            aria-label="flock name"
            className="w-full rounded-full border border-sky-900/20 bg-white/70 px-5 py-2 text-sm font-medium shadow-sm backdrop-blur outline-none placeholder:text-sky-900/40 focus:border-amber-500"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-sky-950 px-5 py-2 text-sm font-bold tracking-widest text-amber-300 uppercase shadow-sm transition hover:bg-sky-900 active:scale-95"
          >
            set flock
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-sky-900/60">
          <span className="rounded-full border border-sky-900/15 bg-white/50 px-3 py-1">
            flock: {flock}
          </span>
          <span className="rounded-full border border-sky-900/15 bg-white/50 px-3 py-1">
            squawks: {squawks}
          </span>
          <span className="rounded-full border border-sky-900/15 bg-white/50 px-3 py-1">
            try ?flock=&amp;flock=&amp;squawks=999 — zod .catch() falls back
          </span>
        </div>

        <div className="mt-6 grid w-full gap-3 sm:grid-cols-3">
          <section className="rounded-3xl border border-sky-900/10 bg-white/70 p-4 text-left shadow-sm backdrop-blur">
            <h2 className="text-[10px] font-black tracking-[0.25em] text-sky-900/50 uppercase">
              squawk count
            </h2>
            <div className="mt-1 flex items-end justify-between gap-2">
              <p className="text-4xl font-black tabular-nums">{report.squawkCount}</p>
              <SquawkButton flock={flock} />
            </div>
          </section>

          <section className="rounded-3xl border border-sky-900/10 bg-white/70 p-4 text-left shadow-sm backdrop-blur">
            <h2 className="text-[10px] font-black tracking-[0.25em] text-sky-900/50 uppercase">
              gull of the day
            </h2>
            <p className="mt-1 text-xl font-black">{report.gullOfTheDay.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-sky-900/70">
              {report.gullOfTheDay.fact}
            </p>
          </section>

          <section className="rounded-3xl border border-sky-900/10 bg-white/70 p-4 text-left shadow-sm backdrop-blur">
            <h2 className="text-[10px] font-black tracking-[0.25em] text-sky-900/50 uppercase">
              tide report <span className="text-amber-600 normal-case">· streamed</span>
            </h2>
            <Await
              promise={report.tide}
              fallback={
                <p className="mt-2 animate-pulse text-xs font-medium text-sky-900/50">
                  listening for the tide…
                </p>
              }
            >
              {(tide) => (
                <div className="mt-1">
                  <p className="text-xl font-black capitalize">{tide.state}</p>
                  <p className="text-xs leading-relaxed text-sky-900/70">{tide.note}</p>
                </div>
              )}
            </Await>
          </section>
        </div>
      </section>

      <Waves className="absolute right-0 bottom-0 left-0" />
    </main>
  )
}
