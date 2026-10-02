import type { CharacterId } from '@/lib/zesto/config'
import type { LandmarkId, SpiritId, TileId, WonderId } from './data'

export type SpiritVisit = { id: SpiritId; at: string }

export type HabitatState = {
  player: { wallet: string; character: CharacterId; totalPoints: number } | null
  island: {
    tiles: string
    radius: number
    seeds: number
    maxSeeds: number
    nextSeedAt: string | null
    discovered: LandmarkId[]
    wonders: WonderId[]
    hints: LandmarkId[]
    spirits: SpiritVisit[]
    lanterns: number
    placements: number
    streak: number
    checkedInToday: boolean
    nextCheckinPoints: number
  } | null
  log: { id: number; source: string; points: number; detail: string; createdAt: string }[]
  serverTime: string
}

export type PublicIsland = {
  wallet: string
  character: CharacterId
  totalPoints: number
  tiles: string
  radius: number
  spirits: SpiritVisit[]
  lanterns: number
  discovered: number
  wonders: WonderId[]
}

export type HabitatAction =
  | { type: 'place'; index: number; tile: TileId }
  | { type: 'checkin' }
  | { type: 'seeds' }
  | { type: 'hint' }
  | { type: 'expand' }
  | { type: 'summon' }
  | { type: 'lantern'; owner: string }

export type HabitatOutcome = {
  title: string
  description?: string
  points: number
  landmarks?: LandmarkId[]
  wonders?: WonderId[]
  spirit?: SpiritId
  hint?: LandmarkId
  fee?: number
}
