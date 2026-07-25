// Generates the app's home-screen icons from the real Fight Lab brand mark
// (scripts/source-logo.png: black ink on transparent, with a red ribbon
// accent). Steps: recolor the black ink to white and the red ribbon stays
// red (source has some compression-artifact color fringing that gets
// cleaned up along the way), crop off the original "Fight Lab / BJJ & MMA"
// wordmark, compose a black square canvas with the mark plus fresh "FLT"
// text, then export the sizes the manifest/index.html reference.
import sharp from 'sharp'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function isReddish(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  if (max === min) return false
  const d = max - min
  const l = (max + min) / 2
  const s = l > 127 ? d / (510 - max - min) : d / (max + min)
  let h
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0))
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  h *= 60
  const isRedHue = h < 20 || h > 340
  return isRedHue && s > 0.55
}

async function recolorToWhite(srcPath) {
  const img = sharp(srcPath).ensureAlpha()
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
    if (a === 0) continue
    if (!isReddish(r, g, b)) {
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
    }
  }
  return sharp(data, { raw: { width, height, channels } }).png().toBuffer()
}

const CANVAS = 1500
const MARK_CROP_HEIGHT = 1290 // excludes the original wordmark below the mark

const recolored = await recolorToWhite(join(__dirname, 'source-logo.png'))
const markOnly = await sharp(recolored)
  .extract({ left: 0, top: 0, width: 1500, height: MARK_CROP_HEIGHT })
  .toBuffer()

const markResized = await sharp(markOnly).resize({ width: 1280 }).toBuffer()
const markMeta = await sharp(markResized).metadata()
const markLeft = Math.round((CANVAS - markMeta.width) / 2)
const markTop = 30

const textSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS}" height="220">
  <text x="${CANVAS / 2}" y="165" font-family="Georgia, 'Times New Roman', serif" font-weight="700"
    font-size="150" fill="#f5f2f1" text-anchor="middle" letter-spacing="14">FLT</text>
</svg>
`)
const textTop = markTop + markMeta.height - 10

const composed = await sharp({
  create: { width: CANVAS, height: CANVAS, channels: 4, background: '#0f0f0f' },
})
  .composite([
    { input: markResized, left: markLeft, top: markTop },
    { input: textSvg, left: 0, top: textTop },
  ])
  .flatten({ background: '#0f0f0f' })
  .png()
  .toBuffer()

const targets = [
  { file: 'public/icons/icon-192.png', size: 192 },
  { file: 'public/icons/icon-512.png', size: 512 },
  { file: 'public/apple-touch-icon.png', size: 180 },
]

for (const { file, size } of targets) {
  await sharp(composed).resize(size, size).png().toFile(join(root, file))
  console.log(`wrote ${file} (${size}x${size})`)
}
