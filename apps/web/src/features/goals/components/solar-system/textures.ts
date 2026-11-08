import * as THREE from 'three'
import type { PlanetPalette } from '../../lib/solar'

// Texturas desenhadas em canvas na hora: nada de imagens para baixar,
// e cada meta ganha um planeta único a partir do próprio id.

const cache = new Map<string, THREE.Texture>()

function seeded(seed: string) {
  let state = 0
  for (let i = 0; i < seed.length; i++) {
    state = Math.imul(state ^ seed.charCodeAt(i), 2654435761)
  }
  // mulberry32
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

function mix(a: number[], b: number[], t: number) {
  const k = Math.min(1, Math.max(0, t))
  return a.map((value, i) => Math.round(value + (b[i] - value) * k))
}

const rgb = (color: number[], alpha = 1) =>
  `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`

// Ruído 1D suave e periódico, para as faixas não terem cara de listra
function smoothNoise(random: () => number, size = 32) {
  const values = Array.from({ length: size }, random)
  return (x: number) => {
    const scaled = (((x % 1) + 1) % 1) * size
    const i = Math.floor(scaled)
    const f = scaled - i
    const t = f * f * (3 - 2 * f)
    return values[i] * (1 - t) + values[(i + 1) % size] * t
  }
}

function paintGas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  light: number[],
  dark: number[],
  random: () => number,
) {
  const noise = smoothNoise(random)
  const wobble = smoothNoise(random, 16)
  const frequency = 5 + random() * 6

  for (let y = 0; y < h; y++) {
    const t = y / h
    const band =
      0.5 +
      0.5 * Math.sin(t * frequency * Math.PI + noise(t * 2) * 5) * 0.8 +
      (noise(t * 7) - 0.5) * 0.5
    const color = mix(dark, light, band)
    // Faixas levemente onduladas no sentido horizontal
    for (let x = 0; x < w; x += 8) {
      const shade = (wobble(x / w + t * 3) - 0.5) * 18
      ctx.fillStyle = rgb(color.map((c) => c + shade))
      ctx.fillRect(x, y, 8, 1)
    }
  }

  // Uma grande tempestade, como a mancha de Júpiter
  const sx = random() * w
  const sy = h * (0.3 + random() * 0.4)
  const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.12)
  gradient.addColorStop(0, rgb(mix(light, [255, 255, 255], 0.5), 0.75))
  gradient.addColorStop(0.6, rgb(dark, 0.35))
  gradient.addColorStop(1, rgb(dark, 0))
  ctx.save()
  ctx.translate(sx, sy)
  ctx.scale(2.2, 1)
  ctx.translate(-sx, -sy)
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(sx, sy, h * 0.12, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function paintRocky(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  light: number[],
  dark: number[],
  random: () => number,
) {
  ctx.fillStyle = rgb(mix(dark, light, 0.45))
  ctx.fillRect(0, 0, w, h)

  // Continentes: manchas grandes e suaves
  for (let i = 0; i < 26; i++) {
    const x = random() * w
    const y = h * (0.15 + random() * 0.7)
    const r = h * (0.08 + random() * 0.22)
    const tone = random() > 0.5 ? light : dark
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r)
    gradient.addColorStop(0, rgb(tone, 0.55))
    gradient.addColorStop(1, rgb(tone, 0))
    ctx.fillStyle = gradient
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }

  // Crateras
  for (let i = 0; i < 90; i++) {
    const x = random() * w
    const y = h * (0.1 + random() * 0.8)
    const r = 1 + random() ** 2 * h * 0.05
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
    ctx.lineWidth = Math.max(0.6, r * 0.25)
    ctx.beginPath()
    ctx.arc(x - r * 0.15, y - r * 0.15, r, Math.PI, Math.PI * 1.75)
    ctx.stroke()
  }
}

function paintIce(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  light: number[],
  dark: number[],
  random: () => number,
) {
  const noise = smoothNoise(random)
  for (let y = 0; y < h; y++) {
    const t = y / h
    ctx.fillStyle = rgb(mix(light, dark, 0.15 + noise(t * 3) * 0.35))
    ctx.fillRect(0, y, w, 1)
  }
  // Rachaduras finas
  ctx.strokeStyle = rgb(dark, 0.25)
  for (let i = 0; i < 30; i++) {
    ctx.lineWidth = 0.5 + random()
    ctx.beginPath()
    let x = random() * w
    let y = h * (0.2 + random() * 0.6)
    ctx.moveTo(x, y)
    for (let s = 0; s < 5; s++) {
      x += (random() - 0.5) * 60
      y += (random() - 0.5) * 20
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  // Calotas polares
  for (const [y0, y1] of [
    [0, h * 0.14],
    [h, h * 0.86],
  ]) {
    const gradient = ctx.createLinearGradient(0, y0, 0, y1)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, Math.min(y0, y1), w, Math.abs(y1 - y0))
  }
}

export function planetTexture(id: string, palette: PlanetPalette) {
  const key = `${id}:${palette.light}:${palette.kind}`
  const cached = cache.get(key)
  if (cached) return cached

  const w = 512
  const h = 256
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const random = seeded(id)
  const light = hexToRgb(palette.light)
  const dark = hexToRgb(palette.dark)

  if (palette.kind === 'gas') paintGas(ctx, w, h, light, dark, random)
  else if (palette.kind === 'rocky') paintRocky(ctx, w, h, light, dark, random)
  else paintIce(ctx, w, h, light, dark, random)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.anisotropy = 4
  cache.set(key, texture)
  return texture
}

// Brilho radial branco; a cor vem do material
export function glowTexture() {
  const cached = cache.get('glow')
  if (cached) return cached

  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  )
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.18, 'rgba(255,255,255,0.55)')
  gradient.addColorStop(0.45, 'rgba(255,255,255,0.14)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  cache.set('glow', texture)
  return texture
}

// Estrela de quatro pontas com halo, para as metas conquistadas
export function starTexture() {
  const cached = cache.get('star')
  if (cached) return cached

  const size = 256
  const c = size / 2
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const halo = ctx.createRadialGradient(c, c, 0, c, c, c)
  halo.addColorStop(0, 'rgba(255,255,255,0.9)')
  halo.addColorStop(0.12, 'rgba(255,255,255,0.35)')
  halo.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = halo
  ctx.fillRect(0, 0, size, size)

  ctx.fillStyle = 'rgba(255,255,255,1)'
  const arm = c * 0.95
  const k = c * 0.09
  ctx.beginPath()
  ctx.moveTo(c, c - arm)
  ctx.quadraticCurveTo(c + k, c - k, c + arm, c)
  ctx.quadraticCurveTo(c + k, c + k, c, c + arm)
  ctx.quadraticCurveTo(c - k, c + k, c - arm, c)
  ctx.quadraticCurveTo(c - k, c - k, c, c - arm)
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  cache.set('star', texture)
  return texture
}
