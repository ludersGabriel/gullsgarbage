/**
 * SERVER-ONLY BOUNDARY.
 *
 * This file must never reach the client bundle:
 *  - the `*.server.ts` filename opts it into TanStack Start's import protection,
 *  - the marker import makes the boundary explicit and enforced at build time.
 *
 * Everything here is process-side state and slow "upstream" work. Route
 * loaders and components never import this file directly — they go through
 * the typed server functions in `gulls.functions.ts`, which the build
 * replaces with RPC stubs on the client.
 */
import '@tanstack/react-start/server-only'

export type GullOfTheDay = {
  name: string
  fact: string
}

export type TideReport = {
  state: 'high' | 'low' | 'turning'
  at: string
  note: string
}

export type GullReport = {
  flock: string
  greeting: string
  squawks: number
  squawkCount: number
  gullOfTheDay: GullOfTheDay
}

const GULL_ROSTER: GullOfTheDay[] = [
  { name: 'Kevin', fact: 'can spot a dropped chip from 200 meters' },
  { name: 'Margo', fact: 'once stole a whole sandwich mid-air' },
  { name: 'Reginald', fact: 'nests on the pier pylon and yells at passers-by' },
  { name: 'Doris', fact: 'knows the ice-cream van schedule better than the driver' },
  { name: 'Beaky', fact: 'circumnavigated the harbor three times before breakfast' },
]

// Process-local server state — the authoritative squawk counter.
const squawkCounts = new Map<string, number>()

export function getSquawkCount(flock: string): number {
  return squawkCounts.get(flock) ?? 0
}

export function addSquawk(flock: string): number {
  const next = getSquawkCount(flock) + 1
  squawkCounts.set(flock, next)
  return next
}

export function gullOfTheDay(flock: string): GullOfTheDay {
  const index = flock.length % GULL_ROSTER.length
  return GULL_ROSTER[index]!
}

/** Slow "upstream" work — the piece we stream in after the first paint. */
export async function fetchTideReport(): Promise<TideReport> {
  await new Promise((resolve) => setTimeout(resolve, 1200))

  const hour = new Date().getHours()
  const phase = hour % 12
  const state = phase < 4 ? ('high' as const) : phase < 8 ? ('turning' as const) : ('low' as const)
  const at = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return {
    state,
    at,
    note:
      state === 'high'
        ? 'water is up to the bench legs — prime chip-diving conditions'
        : state === 'low'
          ? 'the sandbar is out — gulls are holding a committee meeting on it'
          : 'the tide is turning — expect chaos at the shoreline buffet',
  }
}

export function buildGreeting(flock: string): string {
  return `hello ${flock}`
}
