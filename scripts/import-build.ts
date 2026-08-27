import { access, cp, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { isSlug } from '../src/content/paths'

const [srcArg, slug] = process.argv.slice(2)

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

if (!srcArg) fail('usage: bun scripts/import-build.ts <path-to-unity-webgl-build> <slug>')
if (!slug || !isSlug(slug)) {
  fail(
    'usage: bun scripts/import-build.ts <path-to-build> <slug>\n  slug must be kebab-case [a-z0-9-]+',
  )
}

const src = path.resolve(srcArg)
const indexHtml = path.join(src, 'index.html')
const buildDir = path.join(src, 'Build')

try {
  await access(indexHtml)
} catch {
  fail(`not a Unity WebGL build: missing index.html in ${src}`)
}
try {
  await access(buildDir)
} catch {
  fail(`not a Unity WebGL build: missing Build/ in ${src}`)
}

const dest = path.join(process.cwd(), 'public', 'play', slug)
await rm(dest, { recursive: true, force: true })
await cp(src, dest, { recursive: true })
console.log(`copied ${src} -> ${path.relative(process.cwd(), dest)}`)

// Mark the game as playable in-page, preserving the rest of the file byte-for-byte.
const gamePath = path.join(process.cwd(), 'content', 'games', slug, 'index.md')
let raw: string
try {
  raw = await readFile(gamePath, 'utf8')
} catch {
  console.log(
    `note: no game page at ${path.relative(process.cwd(), gamePath)} — run bun scripts/new-game.ts ${slug} "Title" first`,
  )
  process.exit(0)
}

const lines = raw.split('\n')
const open = lines.findIndex((line) => line.trim() === '---')
const close = lines.findIndex((line, i) => i > open && line.trim() === '---')
if (open === -1 || close === -1) {
  fail(`could not find YAML frontmatter in ${path.relative(process.cwd(), gamePath)}`)
}
const hasPlay = lines.slice(open + 1, close).some((line) => /^play\s*:/.test(line))
if (hasPlay) {
  console.log(`play: already set in ${path.relative(process.cwd(), gamePath)} — left as-is`)
} else {
  const updated = [
    ...lines.slice(0, close),
    'play:',
    '  kind: embedded',
    ...lines.slice(close),
  ].join('\n')
  await writeFile(gamePath, updated, 'utf8')
  console.log(`set play.kind: embedded in ${path.relative(process.cwd(), gamePath)}`)
}

console.log('done — run `docker compose up -d --build` to ship the build')
