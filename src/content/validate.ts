import '@tanstack/react-start/server-only'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { devlogFrontmatterSchema, gameFrontmatterSchema } from './schema'
import { formatZodIssues, parseFrontmatter } from './frontmatter'
import { GAMES_DIR, devlogsDir, gameFile, isSlug } from './paths'

const POST_FILE_RE = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/

function relative(p: string): string {
  return path.relative(process.cwd(), p)
}

/**
 * Validate every game and devlog in `content/` and return a flat list of
 * human-readable problems (empty when everything is valid).
 */
export async function validateContent(): Promise<string[]> {
  const errors: string[] = []

  let gameDirs: string[]
  try {
    gameDirs = (await readdir(GAMES_DIR, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  } catch {
    return [] // no content directory yet — nothing to validate
  }

  for (const slug of gameDirs) {
    if (!isSlug(slug)) {
      errors.push(`${relative(path.join(GAMES_DIR, slug))}: invalid game slug`)
      continue
    }

    const gamePath = gameFile(slug)
    try {
      const { data } = parseFrontmatter(await readFile(gamePath, 'utf8'))
      const parsed = gameFrontmatterSchema.safeParse(data)
      if (!parsed.success) {
        errors.push(...formatZodIssues(parsed.error).map((i) => `${relative(gamePath)}: ${i}`))
      }
    } catch (err) {
      errors.push(`${relative(gamePath)}: ${err instanceof Error ? err.message : String(err)}`)
    }

    let filenames: string[]
    try {
      filenames = await readdir(devlogsDir(slug))
    } catch {
      continue
    }
    for (const filename of filenames) {
      if (!filename.endsWith('.md')) continue
      const postPath = path.join(devlogsDir(slug), filename)
      if (!POST_FILE_RE.test(filename)) {
        errors.push(`${relative(postPath)}: filename must be <YYYY-MM-DD>-<slug>.md`)
        continue
      }
      try {
        const { data } = parseFrontmatter(await readFile(postPath, 'utf8'))
        const parsed = devlogFrontmatterSchema.safeParse(data)
        if (!parsed.success) {
          errors.push(...formatZodIssues(parsed.error).map((i) => `${relative(postPath)}: ${i}`))
        }
      } catch (err) {
        errors.push(`${relative(postPath)}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }

  return errors
}
