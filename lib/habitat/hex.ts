export const GRID_RADIUS = 5
export const HEX_SIZE = 1

export type Hex = { q: number; r: number; index: number; ring: number; x: number; z: number }

const SQRT3 = Math.sqrt(3)

export function hexToWorld(q: number, r: number) {
  return { x: HEX_SIZE * SQRT3 * (q + r / 2), z: HEX_SIZE * 1.5 * r }
}

export function ringOf(q: number, r: number) {
  return Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r))
}

export const HEXES: Hex[] = (() => {
  const list: Hex[] = []
  for (let r = -GRID_RADIUS; r <= GRID_RADIUS; r++) {
    for (let q = -GRID_RADIUS; q <= GRID_RADIUS; q++) {
      if (Math.abs(q + r) > GRID_RADIUS) continue
      list.push({ q, r, index: list.length, ring: ringOf(q, r), ...hexToWorld(q, r) })
    }
  }
  return list
})()

export const TILE_COUNT = HEXES.length

const INDEX_BY_KEY = new Map(HEXES.map((h) => [`${h.q},${h.r}`, h.index]))

export function hexIndex(q: number, r: number) {
  return INDEX_BY_KEY.get(`${q},${r}`) ?? -1
}

const DIRECTIONS = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
] as const

/** Neighbor indices per hex; -1 means open ocean beyond the grid. */
export const NEIGHBORS: number[][] = HEXES.map((h) => DIRECTIONS.map(([dq, dr]) => hexIndex(h.q + dq, h.r + dr)))
