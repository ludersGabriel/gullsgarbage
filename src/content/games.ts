import '@tanstack/react-start/server-only'
import { readdir, readFile } from 'node:fs/promises'
import type { Dirent } from 'node:fs'
import { GAMES_DIR, assertSlug, gameFile, isNotFound, isSlug } from './paths'
import { gameFrontmatterSchema, type Game, type GameSummary } from './schema'
import { ContentError, formatZodIssues, parseFrontmatter } from './frontmatter'
import { renderMarkdown } from './markdown'
import { listDevlogs } from './devlogs'

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10)
}

async function readGameRaw(slug: string) {
  const file = gameFile(slug)
  const raw = await readFile(file, 'utf8')
  const { data, content } = parseFrontmatter(raw)
  const parsed = gameFrontmatterSchema.safeParse(data)
  if (!parsed.success) {
    throw new ContentError(file, formatZodIssues(parsed.error))
  }
  return { file, frontmatter: parsed.data, content }
}

function summarize(
  slug: string,
  frontmatter: Awaited<ReturnType<typeof readGameRaw>>['frontmatter'],
): GameSummary {
  return {
    slug,
    title: frontmatter.title,
    tagline: frontmatter.tagline,
    status: frontmatter.status,
    jam: frontmatter.jam,
    releasedAt: frontmatter.releasedAt ? toIso(frontmatter.releasedAt) : undefined,
    updatedAt: frontmatter.updatedAt ? toIso(frontmatter.updatedAt) : undefined,
    cover: frontmatter.cover,
    tags: frontmatter.tags,
  }
}

function newestFirst(a: GameSummary, b: GameSummary): number {
  const aDate = Date.parse(a.releasedAt ?? a.updatedAt ?? '')
  const bDate = Date.parse(b.releasedAt ?? b.updatedAt ?? '')
  return (bDate || 0) - (aDate || 0) || a.title.localeCompare(b.title)
}

export async function listGames(): Promise<GameSummary[]> {
  let entries: Dirent[]
  try {
    entries = await readdir(GAMES_DIR, { withFileTypes: true })
  } catch (err) {
    if (isNotFound(err)) return []
    throw err
  }
  const games: GameSummary[] = []
  for (const entry of entries) {
    if (!entry.isDirectory() || !isSlug(entry.name)) continue
    const { frontmatter } = await readGameRaw(entry.name)
    games.push(summarize(entry.name, frontmatter))
  }
  return games.sort(newestFirst)
}

export async function getGameSummary(slug: string): Promise<GameSummary | null> {
  assertSlug(slug)
  try {
    const { frontmatter } = await readGameRaw(slug)
    return summarize(slug, frontmatter)
  } catch (err) {
    if (isNotFound(err)) return null
    throw err
  }
}

export async function getGame(slug: string): Promise<Game | null> {
  assertSlug(slug)
  let frontmatter: Awaited<ReturnType<typeof readGameRaw>>['frontmatter']
  let content: string
  try {
    const raw = await readGameRaw(slug)
    frontmatter = raw.frontmatter
    content = raw.content
  } catch (err) {
    if (isNotFound(err)) return null
    throw err
  }
  const [html, devlogs] = await Promise.all([renderMarkdown(content), listDevlogs(slug)])
  return {
    ...summarize(slug, frontmatter),
    html,
    play: frontmatter.play,
    links: frontmatter.links,
    devlogCount: devlogs.length,
  }
}
