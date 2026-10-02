import { WATER_Y, sandHeight, smoothstep, terrainColor, waterColor } from './world'

/** World-space window shown on the 2D maps (padded around the walkable bounds). */
export const MAP_EXTENT = { minX: -14, maxX: 52, minZ: -66, maxZ: 37 }
export const MAP_W = MAP_EXTENT.maxX - MAP_EXTENT.minX
export const MAP_H = MAP_EXTENT.maxZ - MAP_EXTENT.minZ

const PX_PER_UNIT = 6

/** Converts world coordinates to 0-100 percentages on the map image. North (-z) is up. */
export function toMapPercent(x: number, z: number) {
  return {
    left: ((x - MAP_EXTENT.minX) / MAP_W) * 100,
    top: ((z - MAP_EXTENT.minZ) / MAP_H) * 100,
  }
}

let cached: string | null = null

export function getMapImage(): string {
  if (cached) return cached
  if (typeof document === 'undefined') return ''
  const w = Math.round(MAP_W * PX_PER_UNIT)
  const h = Math.round(MAP_H * PX_PER_UNIT)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const img = ctx.createImageData(w, h)
  const step = 1 / PX_PER_UNIT
  for (let j = 0; j < h; j++) {
    const z = MAP_EXTENT.minZ + j * step
    for (let i = 0; i < w; i++) {
      const x = MAP_EXTENT.minX + i * step
      const y = sandHeight(x, z)
      let r: number, g: number, b: number
      const depth = WATER_Y - y
      if (depth > 0) {
        ;[r, g, b] = waterColor(depth)
        const foam = 1 - smoothstep(0, 0.35, depth)
        r += (1 - r) * foam * 0.7
        g += (1 - g) * foam * 0.7
        b += (1 - b) * foam * 0.7
      } else {
        ;[r, g, b] = terrainColor(x, z, y)
        const dx = sandHeight(x + step, z) - y
        const dz = sandHeight(x, z + step) - y
        const shade = Math.max(0.55, Math.min(1.3, 1 + (-dx - dz) * 2.4))
        r *= shade
        g *= shade
        b *= shade
      }
      const k = (j * w + i) * 4
      img.data[k] = Math.min(255, r * 255)
      img.data[k + 1] = Math.min(255, g * 255)
      img.data[k + 2] = Math.min(255, b * 255)
      img.data[k + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  cached = canvas.toDataURL('image/png')
  return cached
}
