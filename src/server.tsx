import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server'
import type { Register } from '@tanstack/react-router'
import type { RequestHandler } from '@tanstack/react-start/server'

/**
 * Server entry — FULL-DOCUMENT, STREAMING SSR.
 *
 * `defaultStreamHandler` streams the complete HTML document: the shell and
 * first paint flush immediately, deferred loader data (unawaited promises)
 * streams in afterwards.
 */
const fetch = createStartHandler(defaultStreamHandler)

export type ServerEntry = { fetch: RequestHandler<Register> }

export function createServerEntry(entry: ServerEntry): ServerEntry {
  return {
    async fetch(...args) {
      return await entry.fetch(...args)
    },
  }
}

export default createServerEntry({ fetch })
