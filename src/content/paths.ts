import '@tanstack/react-start/server-only'
import path from 'node:path'

/**
 * Content lives OUTSIDE the bundle and is read at request time with node:fs,
 * so it must be present in the runtime container (Dockerfile copies `content`).
 * `CONTENT_DIR` can override the default `./content` relative to cwd.
 */
export const CONTENT_DIR = process.env.CONTENT_DIR
  ? path.resolve(process.env.CONTENT_DIR)
  : path.join(process.cwd(), 'content')

export const GAMES_DIR = path.join(CONTENT_DIR, 'games')

/** Slugs are kebab-case and are the only dynamic part of a content path. */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isSlug(slug: string): boolean {
  return SLUG_RE.test(slug)
}

export function assertSlug(slug: string, label = 'slug'): string {
  if (!isSlug(slug)) {
    throw new Error(`invalid ${label} "${slug}" (expected kebab-case [a-z0-9-]+)`)
  }
  return slug
}

/** True for `ENOENT` (file/dir missing) — the "not found" case, not a bug. */
export function isNotFound(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: unknown }).code === 'ENOENT'
  )
}

export function gameDir(slug: string): string {
  return path.join(GAMES_DIR, assertSlug(slug))
}

export function gameFile(slug: string): string {
  return path.join(gameDir(slug), 'index.md')
}

export function devlogsDir(slug: string): string {
  return path.join(gameDir(slug), 'devlogs')
}
