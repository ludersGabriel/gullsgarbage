import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { isSlug } from '../src/content/paths'

const [slug, ...titleParts] = process.argv.slice(2)
const title = titleParts.join(' ')

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

if (!slug || !isSlug(slug)) {
  fail('usage: bun scripts/new-game.ts <slug> "Title"\n  slug must be kebab-case [a-z0-9-]+')
}
if (!title) {
  fail('usage: bun scripts/new-game.ts <slug> "Title"')
}

const gameDir = path.join(process.cwd(), 'content', 'games', slug)
const mediaDir = path.join(process.cwd(), 'public', 'media', 'games', slug)

const indexMd = `---
title: ${JSON.stringify(title)}
tagline: ''
status: in-development
# jam: GMTK 2025
# releasedAt: 2025-08-20
# updatedAt: 2025-08-20
# cover: /media/games/${slug}/cover.png
# play:
#   kind: embedded
# links:
#   - label: itch.io
#     url: https://your-name.itch.io/${slug}
# tags:
#   - jam
---

Write a short pitch here — what is it, what did you build it with, and what is the hook?
`

async function writeIfMissing(file: string, content: string): Promise<boolean> {
  try {
    await writeFile(file, content, { flag: 'wx' })
    return true
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'EEXIST') return false
    throw err
  }
}

await mkdir(path.join(gameDir, 'devlogs'), { recursive: true })
await mkdir(mediaDir, { recursive: true })

const indexPath = path.join(gameDir, 'index.md')
const wroteIndex = await writeIfMissing(indexPath, indexMd)
await writeIfMissing(path.join(mediaDir, '.gitkeep'), '')

console.log(
  wroteIndex
    ? `created ${path.relative(process.cwd(), indexPath)}`
    : `exists   ${path.relative(process.cwd(), indexPath)}`,
)
console.log(`media    ${path.relative(process.cwd(), mediaDir)}/ (drop cover.png here)`)
console.log(`next     bun scripts/new-devlog.ts ${slug} "First build"`)
