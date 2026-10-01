import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'

const colors = {
  white: '#FFFFFF',
  teal: '#038B7D',
  tealDeep: '#0A4A45',
  gold: '#FAB502',
  goldDark: '#C68E00',
  ink: '#111827',
  surface: '#F7F4EB',
  placeholder: '#596273',
  status: '#EAF2EC',
}
const themeCss = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')

function overlayAlpha(variable) {
  const declaration = themeCss.match(new RegExp(`${variable}:\\s*rgba\\([^)]*\\)`))?.[0]
  const match = declaration?.match(/,\s*([\d.]+)\s*\)$/)
  if (!match) throw new Error(`Could not read ${variable} from src/index.css`)
  return Number(match[1])
}

const solidPairs = [
  ['Header and navigation', colors.white, colors.tealDeep, 4.5],
  ['Impact list', colors.white, colors.tealDeep, 4.5],
  ['Gold eyebrow on deep teal', colors.gold, colors.tealDeep, 4.5],
  ['Ink on surface', colors.ink, colors.surface, 4.5],
  ['Ink on white', colors.ink, colors.white, 4.5],
  ['Contact heading on deep teal', colors.white, colors.tealDeep, 3],
  ['Gold CTA label', colors.ink, colors.gold, 4.5],
  ['Gold CTA hover label', colors.ink, colors.goldDark, 4.5],
  ['Deep teal eyebrow on surface', colors.tealDeep, colors.surface, 4.5],
  ['Form label', colors.ink, colors.white, 4.5],
  ['Input placeholder', colors.placeholder, colors.white, 4.5],
  ['Prototype status', colors.ink, colors.status, 4.5],
  ['Footer text', colors.white, colors.ink, 4.5],
]

const imagePath = new URL('../public/community-outreach.png', import.meta.url)
const png = readFileSync(imagePath)
const pngSignature = '89504e470d0a1a0a'
if (png.subarray(0, 8).toString('hex') !== pngSignature) {
  throw new Error('community-outreach.png is not a PNG file')
}

let width
let height
let bitDepth
let colorType
let interlace
const compressed = []
for (let offset = 8; offset < png.length;) {
  const length = png.readUInt32BE(offset)
  const type = png.toString('ascii', offset + 4, offset + 8)
  const data = png.subarray(offset + 8, offset + 8 + length)
  if (type === 'IHDR') {
    width = data.readUInt32BE(0)
    height = data.readUInt32BE(4)
    bitDepth = data[8]
    colorType = data[9]
    interlace = data[12]
  } else if (type === 'IDAT') {
    compressed.push(data)
  } else if (type === 'IEND') {
    break
  }
  offset += length + 12
}

if (bitDepth !== 8 || colorType !== 2 || interlace !== 0) {
  throw new Error('Expected a non-interlaced, 8-bit RGB community photo')
}

const bytesPerPixel = 3
const stride = width * bytesPerPixel
const inflated = inflateSync(Buffer.concat(compressed))
const pixels = Buffer.alloc(stride * height)
let sourceOffset = 0

function paeth(left, above, upperLeft) {
  const estimate = left + above - upperLeft
  const leftDistance = Math.abs(estimate - left)
  const aboveDistance = Math.abs(estimate - above)
  const upperLeftDistance = Math.abs(estimate - upperLeft)
  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left
  if (aboveDistance <= upperLeftDistance) return above
  return upperLeft
}

for (let y = 0; y < height; y += 1) {
  const filter = inflated[sourceOffset]
  sourceOffset += 1
  const rowOffset = y * stride
  const previousRowOffset = rowOffset - stride
  for (let index = 0; index < stride; index += 1) {
    const raw = inflated[sourceOffset]
    sourceOffset += 1
    const left = index >= bytesPerPixel ? pixels[rowOffset + index - bytesPerPixel] : 0
    const above = y > 0 ? pixels[previousRowOffset + index] : 0
    const upperLeft = y > 0 && index >= bytesPerPixel
      ? pixels[previousRowOffset + index - bytesPerPixel]
      : 0
    let predictor = 0
    if (filter === 1) predictor = left
    else if (filter === 2) predictor = above
    else if (filter === 3) predictor = Math.floor((left + above) / 2)
    else if (filter === 4) predictor = paeth(left, above, upperLeft)
    else if (filter !== 0) throw new Error(`Unsupported PNG filter: ${filter}`)
    pixels[rowOffset + index] = (raw + predictor) & 0xff
  }
}

function linear(channel) {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function luminance(color) {
  const channels = Array.isArray(color)
    ? color
    : color.slice(1).match(/../g).map((value) => parseInt(value, 16))
  return 0.2126 * linear(channels[0]) + 0.7152 * linear(channels[1]) + 0.0722 * linear(channels[2])
}

function contrast(foreground, background) {
  const first = luminance(foreground)
  const second = luminance(background)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

function rgb(hex) {
  return hex.slice(1).match(/../g).map((value) => parseInt(value, 16))
}

function composite(background, overlay, alpha) {
  return background.map((channel, index) => channel * (1 - alpha) + overlay[index] * alpha)
}

function worstPhotoContrast(alpha, foreground = colors.white) {
  const overlay = rgb(colors.tealDeep)
  let worst = { ratio: Infinity, x: 0, y: 0, background: [] }
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * stride + x * bytesPerPixel
      const source = [pixels[index], pixels[index + 1], pixels[index + 2]]
      const background = composite(source, overlay, alpha)
      const ratio = contrast(foreground, background)
      if (ratio < worst.ratio) worst = { ratio, x, y, background }
    }
  }
  return worst
}

function minimumOverlayAlpha(requiredRatio) {
  let low = 0
  let high = 1
  for (let iteration = 0; iteration < 24; iteration += 1) {
    const middle = (low + high) / 2
    if (worstPhotoContrast(middle).ratio >= requiredRatio) high = middle
    else low = middle
  }
  return high
}

const checks = solidPairs.map(([label, foreground, background, required]) => ({
  label,
  foreground,
  background,
  ratio: contrast(foreground, background),
  required,
}))

for (const [label, variable] of [
  ['Hero gradient left', '--ten-hero-overlay-left'],
  ['Hero gradient right', '--ten-hero-overlay-right'],
]) {
  const alpha = overlayAlpha(variable)
  const worst = worstPhotoContrast(alpha)
  checks.push({
    label: `${label} (worst photo pixel ${worst.x},${worst.y})`,
    foreground: colors.white,
    background: `photo + ${colors.tealDeep} at ${alpha}`,
    ratio: worst.ratio,
    required: 4.5,
    detail: `composited pixel ${worst.background.map(Math.round).join(',')}`,
  })
}

const impactOverlay = 0.95
const impactWorstCaseBackground = composite([255, 255, 255], rgb(colors.tealDeep), impactOverlay)
for (const [label, foreground] of [
  ['Impact white text', colors.white],
  ['Impact gold headings', colors.gold],
]) {
  const ratio = contrast(foreground, impactWorstCaseBackground)
  checks.push({
    label: `${label} (worst-case white image pixel)`,
    foreground,
    background: `photo + ${colors.tealDeep} at ${impactOverlay}`,
    ratio,
    required: 4.5,
    detail: `conservative pixel ${impactWorstCaseBackground.map(Math.round).join(',')}`,
  })
}

const storyWorstCaseBackground = composite([0, 0, 0], rgb(colors.surface), 0.86)
checks.push({
  label: 'Story ink text (worst-case black image pixel)',
  foreground: colors.ink,
  background: `photo + ${colors.surface} at 0.86`,
  ratio: contrast(colors.ink, storyWorstCaseBackground),
  required: 4.5,
  detail: `conservative pixel ${storyWorstCaseBackground.map(Math.round).join(',')}`,
})

console.log(`Image: public/community-outreach.png (${width}x${height}, every pixel sampled)`)
console.log('Pair | Foreground | Background | Ratio | Required | Result')
let failed = false
for (const check of checks) {
  const pass = check.ratio >= check.required
  if (!pass) failed = true
  const detail = check.detail ? ` | ${check.detail}` : ''
  console.log(`${check.label} | ${check.foreground} | ${check.background} | ${check.ratio.toFixed(2)}:1 | ${check.required}:1 | ${pass ? 'PASS' : 'FAIL'}${detail}`)
  if (!pass && check.label.startsWith('Hero gradient')) {
    const endpoint = check.label.includes('left') ? 'left' : 'right'
    console.log(`FIX: raise --ten-hero-overlay-${endpoint} opacity to at least ${minimumOverlayAlpha(check.required).toFixed(2)}, or use a solid backing behind the white text.`)
  } else if (!pass) {
    console.log(`FIX: darken the foreground or lighten the background until the ratio reaches ${check.required}:1.`)
  }
}

if (failed) process.exitCode = 1