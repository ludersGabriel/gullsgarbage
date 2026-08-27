import { z } from 'zod'

export const gameStatusSchema = z.enum([
  'draft',
  'in-development',
  'playable',
  'released',
  'archived',
])

export const linkSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
})

export const playSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('embedded'),
    note: z.string().optional(),
  }),
  z.object({
    kind: z.literal('external'),
    url: z.string().url(),
    note: z.string().optional(),
  }),
])

export const gameFrontmatterSchema = z.object({
  title: z.string().min(1),
  tagline: z.string().default(''),
  status: gameStatusSchema,
  jam: z.string().optional(),
  releasedAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  cover: z.string().min(1).optional(),
  play: playSchema.optional(),
  links: z.array(linkSchema).default([]),
  tags: z.array(z.string().min(1)).default([]),
})

/** Date is derived from the filename (`YYYY-MM-DD-<slug>.md`), not frontmatter. */
export const devlogFrontmatterSchema = z.object({
  title: z.string().min(1),
  build: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  tags: z.array(z.string().min(1)).default([]),
})

export type GameStatus = z.infer<typeof gameStatusSchema>
export type GameLink = z.infer<typeof linkSchema>
export type Play = z.infer<typeof playSchema>

/** Serializable game summary — safe to send to the client (no Date, no html). */
export interface GameSummary {
  slug: string
  title: string
  tagline: string
  status: GameStatus
  jam?: string
  releasedAt?: string
  updatedAt?: string
  cover?: string
  tags: string[]
}

export interface Game extends GameSummary {
  html: string
  play?: Play
  links: GameLink[]
  devlogCount: number
}

export interface DevlogPostSummary {
  slug: string
  gameSlug: string
  title: string
  date: string
  build?: string
  summary?: string
  tags: string[]
}

export interface DevlogPost extends DevlogPostSummary {
  html: string
}
