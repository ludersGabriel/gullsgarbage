import { createCsrfMiddleware, createStart, createMiddleware } from '@tanstack/react-start'
import { setResponseHeader } from '@tanstack/react-start/server'

/**
 * CSRF protection for server functions. Server functions are same-origin
 * RPC endpoints reachable directly (no route guards involved), so every
 * request is validated with Sec-Fetch-Site / Origin / Referer checks.
 * The filter scopes validation to serverFn requests only — regular SSR
 * page renders don't need it.
 */
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
})

/**
 * Global Start configuration. Request middleware runs on the server for
 * EVERY request (SSR pages, server functions, server routes) — an explicit
 * server-side boundary.
 */
const gullTag = createMiddleware().server(async ({ next }) => {
  setResponseHeader('x-gullsgabage', 'squawk')
  return next()
})

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, gullTag],
}))
