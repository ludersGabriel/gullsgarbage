// Generates src/resources/gullblock.png — a blocky pixel-art gull.
// Run once with: bun scripts/make-gullblock.ts
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// 22 x 14 pixel grid. 'O' = gull body, '.' = empty.
const GRID = [
  '....OO..............OO....',
  '...OOOO............OOOO...',
  '..OOOOOO..........OOOOOO..',
  '..OOOOOOO........OOOOOOO..',
  '...OOOOOOO......OOOOOOO...',
  '....OOOOOOO....OOOOOOO....',
  '.....OOOOOOO..OOOOOOO.....',
  '......OOOOOOOOOOOOOO......',
  '.......OOOOOOOOOOOO.......',
  '........OOOOOOOOOO........',
  '.........OOOOOOOO.........',
  '..........OOOOOO..........',
  '...........OOOO...........',
  '............OO............',
]

const SCALE = 12
const W = GRID[0]!.length
const H = GRID.length

const FILL = [255, 255, 255, 255] // white gull
const OUTLINE = [15, 23, 42, 255] // slate-900 outline

const filled = new Set<number>()
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (GRID[y]![x] === 'O') filled.add(y * W + x)
  }
}

const pixel = (x: number, y: number) => filled.has(y * W + x)
const isOutline = (x: number, y: number) =>
  pixel(x, y) && (!pixel(x - 1, y) || !pixel(x + 1, y) || !pixel(x, y - 1) || !pixel(x, y + 1))

const outW = W * SCALE
const outH = H * SCALE
const rgba = Buffer.alloc(outW * outH * 4)

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (!pixel(x, y)) continue
    const color = isOutline(x, y) ? OUTLINE : FILL
    for (let sy = 0; sy < SCALE; sy++) {
      for (let sx = 0; sx < SCALE; sx++) {
        const px = (y * SCALE + sy) * outW + x * SCALE + sx
        rgba.set(color, px * 4)
      }
    }
  }
}

// --- minimal PNG encoder (8-bit RGBA, filter 0) ---
const CRC_TABLE = new Int32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  CRC_TABLE[n] = c
}
const crc32 = (buf: Buffer) => {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type: string, data: Buffer) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(outW, 0)
ihdr.writeUInt32BE(outH, 4)
ihdr[8] = 8 // bit depth
ihdr[9] = 6 // color type: RGBA
const scanlines = Buffer.alloc(outH * (1 + outW * 4))
for (let y = 0; y < outH; y++) {
  scanlines[y * (1 + outW * 4)] = 0 // filter: None
  rgba.copy(scanlines, y * (1 + outW * 4) + 1, y * outW * 4, (y + 1) * outW * 4)
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(scanlines, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
])

const outFile = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'resources',
  'gullblock.png',
)
mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, png)
console.log(`wrote ${outFile} (${outW}x${outH}, ${png.length} bytes)`)
