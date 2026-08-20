/**
 * TYPED SERVER FUNCTIONS.
 *
 * These are the only public entry points to server-only work. The client
 * bundle receives RPC stubs that preserve the full input/output types, so
 * loaders and components get end-to-end type safety across the wire.
 */
import { createServerFn, createMiddleware } from '@tanstack/react-start'
import { setResponseHeader } from '@tanstack/react-start/server'
import { z } from 'zod'
import {
  addSquawk,
  buildGreeting,
  fetchTideReport,
  getSquawkCount,
  gullOfTheDay,
  type TideReport,
} from './gulls.server'

/**
 * Function-level middleware: runs on the server for every call of any
 * function it is attached to. Here it tags the response and guards the
 * squawk endpoint against degenerate input.
 */
const gullMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  setResponseHeader('x-gull-middleware', 'squawk-guard-engaged')
  return next({ context: { guarded: true } })
})

const flockSchema = z.object({
  flock: z
    .string()
    .trim()
    .min(1, 'flock must not be empty')
    .max(40, 'flock is too long for one banner'),
})

/** Fast loader data: greeting + authoritative squawk count + gull of the day. */
export const getGullReport = createServerFn({ method: 'GET' })
  .middleware([gullMiddleware])
  .validator(
    flockSchema.extend({
      squawks: z.number().int().min(0).max(50),
    }),
  )
  .handler(async ({ data }) => {
    const { flock, squawks } = data
    return {
      flock,
      greeting: buildGreeting(flock),
      squawks,
      squawkCount: getSquawkCount(flock),
      gullOfTheDay: gullOfTheDay(flock),
    }
  })

/**
 * Deferred data for streaming: the loader returns this promise UNAWAITED,
 * the stream handler flushes the shell and first paint, and the resolved
 * tide report streams in afterwards.
 */
export const getTideReport = createServerFn({ method: 'GET' })
  .middleware([gullMiddleware])
  .validator(flockSchema)
  .handler(async (): Promise<TideReport> => {
    return fetchTideReport()
  })

/** Mutation: typed input via zod validator, typed output inferred. */
export const squawk = createServerFn({ method: 'POST' })
  .middleware([gullMiddleware])
  .validator(flockSchema)
  .handler(async ({ data }) => {
    const count = addSquawk(data.flock)
    return { flock: data.flock, count }
  })
