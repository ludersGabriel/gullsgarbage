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
  fail('usage: bun scripts/new-devlog.ts <slug> "Title"\n  slug must be kebab-case [a-z0-9-]+')
}
if (!title) {
  fail('usage: bun scripts/new-devlog.ts <slug> "Title"')
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const today = new Date().toISOString().slice(0, 10)
const filename = `${today}-${slugify(title)}.md`
const dir = path.join(process.cwd(), 'content', 'games', slug, 'devlogs')
const file = path.join(dir, filename)

const content = `---
title: ${JSON.stringify(title)}
# build: v0.1
# summary: One-line summary shown in lists.
---

Write the build log here — what changed, what broke, and what's next.
`

async function writeIfMissing(target: string, body: string): Promise<boolean> {
  try {
    await writeFile(target, body, { flag: 'wx' })
    return true
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'EEXIST') return false
    throw err
  }
}

await mkdir(dir, { recursive: true })
const wrote = await writeIfMissing(file, content)
console.log(
  wrote
    ? `created ${path.relative(process.cwd(), file)}`
    : `exists  ${path.relative(process.cwd(), file)}`,
)
