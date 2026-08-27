import '@tanstack/react-start/server-only'
import { readdir, readFile } from 'node:fs/promises'
import type { Dirent } from 'node:fs'
import path from 'node:path'
import { GAMES_DIR, assertSlug, devlogsDir, isNotFound, isSlug } from './paths'
import { devlogFrontmatterSchema, type DevlogPost, type DevlogPostSummary } from './schema'
import { ContentError, formatZodIssues, parseFrontmatter } from './frontmatter'
import { renderMarkdown } from './markdown'

const POST_FILE_RE = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/

interface RawDevlog {
  date: string
  slug: string
  title: string
  build?: string
  summary?: string
  tags: string[]
  content: string
}

async function readDevlogRaw(gameSlug: string, filename: string): Promise<RawDevlog> {
  const match = POST_FILE_RE.exec(filename)
  if (!match) {
    throw new ContentError(path.join(devlogsDir(gameSlug), filename), [
      'filename must be <YYYY-MM-DD>-<slug>.md',
    ])
  }
  const date = match[1]!
  const slug = match[2]!
  const file = path.join(devlogsDir(gameSlug), filename)
  const raw = await readFile(file, 'utf8')
  const { data, content } = parseFrontmatter(raw)
  const parsed = devlogFrontmatterSchema.safeParse(data)
  if (!parsed.success) {
    throw new ContentError(file, formatZodIssues(parsed.error))
  }
  return { date, slug, ...parsed.data, content }
}

function summarize(raw: RawDevlog, gameSlug: string): DevlogPostSummary {
  return {
    slug: raw.slug,
    gameSlug,
    title: raw.title,
    date: raw.date,
    build: raw.build,
    summary: raw.summary,
    tags: raw.tags,
  }
}

export async function listDevlogs(gameSlug: string): Promise<DevlogPostSummary[]> {
  assertSlug(gameSlug)
  let filenames: string[]
  try {
    filenames = await readdir(devlogsDir(gameSlug))
  } catch (err) {
    if (isNotFound(err)) return []
    throw err
  }
  const posts: DevlogPostSummary[] = []
  for (const filename of filenames) {
    if (!filename.endsWith('.md')) continue
    posts.push(summarize(await readDevlogRaw(gameSlug, filename), gameSlug))
  }
  return posts.sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug),
  )
}

export async function getDevlog(gameSlug: string, postSlug: string): Promise<DevlogPost | null> {
  assertSlug(gameSlug)
  let filenames: string[]
  try {
    filenames = await readdir(devlogsDir(gameSlug))
  } catch (err) {
    if (isNotFound(err)) return null
    throw err
  }
  const filename = filenames.find((f) => POST_FILE_RE.exec(f)?.[2] === postSlug)
  if (!filename) return null
  const raw = await readDevlogRaw(gameSlug, filename)
  const html = await renderMarkdown(raw.content)
  return { ...summarize(raw, gameSlug), html }
}

export async function listAllDevlogs(): Promise<DevlogPostSummary[]> {
  let entries: Dirent[]
  try {
    entries = await readdir(GAMES_DIR, { withFileTypes: true })
  } catch (err) {
    if (isNotFound(err)) return []
    throw err
  }
  const all: DevlogPostSummary[] = []
  for (const entry of entries) {
    if (!entry.isDirectory() || !isSlug(entry.name)) continue
    all.push(...(await listDevlogs(entry.name)))
  }
  return all.sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug),
  )
}
