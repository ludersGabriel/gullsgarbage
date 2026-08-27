import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getGame, getGameSummary, listGames } from '~/content/games'
import { getDevlog, listAllDevlogs, listDevlogs } from '~/content/devlogs'

/**
 * Content data access as server functions. The fs-reading implementation
 * lives server-only; route loaders call these, and the client never ships the
 * `node:fs` content modules (createServerFn compiles the handler out of the
 * client bundle into an RPC stub).
 */

export const fetchGames = createServerFn({ method: 'GET' }).handler(() => listGames())

export const fetchGame = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(({ data }) => getGame(data.slug))

export const fetchGameSummary = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(({ data }) => getGameSummary(data.slug))

export const fetchDevlogs = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(({ data }) => listDevlogs(data.slug))

export const fetchDevlog = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string().min(1), post: z.string().min(1) }))
  .handler(({ data }) => getDevlog(data.slug, data.post))

export const fetchAllDevlogs = createServerFn({ method: 'GET' }).handler(() => listAllDevlogs())
