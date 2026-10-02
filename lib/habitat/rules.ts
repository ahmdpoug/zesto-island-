import { LANDMARKS, WONDERS, type LandmarkId, type SeasonId, type TileId, type WonderId } from './data'
import { NEIGHBORS, TILE_COUNT } from './hex'

/** Which landmark currently stands on which tile. Shared by client and server so both agree instantly. */
export function computeLandmarks(tiles: string, season: SeasonId): Map<number, LandmarkId> {
  const placed = new Map<number, LandmarkId>()
  const counts = NEIGHBORS.map((ns) => {
    const c: Partial<Record<TileId, number>> = {}
    for (const n of ns) {
      const t = (n < 0 ? 'w' : tiles[n]) as TileId
      c[t] = (c[t] ?? 0) + 1
    }
    return c
  })

  for (const def of LANDMARKS) {
    if (def.season && def.season !== season) continue
    for (let i = 0; i < TILE_COUNT; i++) {
      if (tiles[i] !== def.on || placed.has(i)) continue
      const ok = (Object.entries(def.need) as [TileId, number][]).every(([t, n]) => (counts[i][t] ?? 0) >= n)
      if (ok) {
        placed.set(i, def.id)
        break
      }
    }
  }
  return placed
}

export function activeWonders(present: Iterable<LandmarkId>): WonderId[] {
  const set = new Set(present)
  return WONDERS.filter((w) => w.landmarks.every((l) => set.has(l))).map((w) => w.id)
}
