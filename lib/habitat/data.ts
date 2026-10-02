import type { CharacterId } from '@/lib/zesto/config'
import { HEXES } from './hex'

export type TileId = 'w' | 'g' | 'f' | 'm' | 's' | 'r' | 'c'
export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter'

export type TileDef = { id: TileId; name: string; hint: string; colors: Record<SeasonId, string> }

export const TILES: TileDef[] = [
  { id: 'g', name: 'Grass', hint: 'Open lawn', colors: { spring: '#8fd16a', summer: '#6fc24c', autumn: '#c9b04a', winter: '#e9eef4' } },
  { id: 'f', name: 'Forest', hint: 'Leafy trees', colors: { spring: '#5fae4c', summer: '#4f9e3f', autumn: '#b9822f', winter: '#dfe7ef' } },
  { id: 'm', name: 'Meadow', hint: 'Wildflowers', colors: { spring: '#a6d66e', summer: '#93cb5b', autumn: '#d2a64a', winter: '#eef2f7' } },
  { id: 'c', name: 'Farm', hint: 'Crop rows', colors: { spring: '#b98a52', summer: '#b07f45', autumn: '#a8713a', winter: '#d9d6d2' } },
  { id: 's', name: 'Sand', hint: 'Soft shore', colors: { spring: '#f0dca6', summer: '#f3d99a', autumn: '#e6cc93', winter: '#e9e7e2' } },
  { id: 'r', name: 'Rock', hint: 'Raised stone', colors: { spring: '#a3a6a8', summer: '#a7a8a6', autumn: '#9d9a95', winter: '#c9d1da' } },
  { id: 'w', name: 'Water', hint: 'Dig a pond', colors: { spring: '#4cc4d6', summer: '#3fbfd4', autumn: '#3aa9c0', winter: '#7cc3dc' } },
]

export const TILE_BY_ID = Object.fromEntries(TILES.map((t) => [t.id, t])) as Record<TileId, TileDef>

export function isTileId(value: unknown): value is TileId {
  return typeof value === 'string' && value in TILE_BY_ID
}

export const START_RADIUS = 2
export const MAX_RADIUS = 5

export const STARTER_TILES = HEXES.map((h) => (h.ring === 0 ? 'm' : h.ring === 1 ? 'g' : h.ring === 2 ? 's' : 'w')).join('')

export type SeasonDef = { id: SeasonId; name: string; sky: string; sea: string; accent: string }

export const SEASONS: SeasonDef[] = [
  { id: 'spring', name: 'Spring', sky: '#bfe6ef', sea: '#3fb6cc', accent: '#ff8fb8' },
  { id: 'summer', name: 'Summer', sky: '#a9def0', sea: '#2fb0c9', accent: '#ffc23d' },
  { id: 'autumn', name: 'Autumn', sky: '#f4c9a0', sea: '#3a9fb6', accent: '#e8792e' },
  { id: 'winter', name: 'Winter', sky: '#c9d6ec', sea: '#4d8fb8', accent: '#8fb7ff' },
]

export const SEASON_BY_ID = Object.fromEntries(SEASONS.map((s) => [s.id, s])) as Record<SeasonId, SeasonDef>

/** Seasons rotate globally once per UTC day so every island shares the same calendar. */
export const SEASON_MS = 24 * 60 * 60 * 1000

export function seasonAt(ms: number) {
  const day = Math.floor(ms / SEASON_MS)
  return { season: SEASONS[day % 4], day, endsAt: (day + 1) * SEASON_MS }
}

export type LandmarkTag = 'water' | 'earth' | 'bloom' | 'season'
export type LandmarkId =
  | 'shrine'
  | 'lighthouse'
  | 'windmill'
  | 'hotspring'
  | 'treehouse'
  | 'scarecrow'
  | 'glasshouse'
  | 'belltower'
  | 'gazebo'
  | 'maypole'
  | 'well'
  | 'stones'
  | 'campfire'
  | 'sundial'
  | 'snowman'
  | 'beehive'
  | 'kite'
  | 'totem'

export type LandmarkDef = {
  id: LandmarkId
  name: string
  on: TileId
  need: Partial<Record<TileId, number>>
  season?: SeasonId
  tag: LandmarkTag
  points: number
  lore: string
}

export const LANDMARKS: LandmarkDef[] = [
  { id: 'shrine', name: 'Island Shrine', on: 's', need: { w: 4 }, tag: 'water', points: 150, lore: 'A torii gate on a lonely sandbar.' },
  { id: 'lighthouse', name: 'Lighthouse', on: 'r', need: { w: 3 }, tag: 'water', points: 150, lore: 'Guides lost spirits home at night.' },
  { id: 'windmill', name: 'Windmill', on: 'c', need: { c: 3 }, tag: 'earth', points: 150, lore: 'Turns lazily over golden fields.' },
  { id: 'hotspring', name: 'Hot Spring', on: 'w', need: { r: 3 }, tag: 'water', points: 200, lore: 'Steam curls up between warm stones.' },
  { id: 'treehouse', name: 'Treehouse', on: 'f', need: { f: 5 }, tag: 'bloom', points: 200, lore: 'Hidden deep in the canopy.' },
  { id: 'scarecrow', name: 'Scarecrow', on: 'c', need: { m: 2 }, season: 'autumn', tag: 'season', points: 250, lore: 'Only stands guard in autumn.' },
  { id: 'glasshouse', name: 'Glasshouse', on: 'm', need: { c: 2, w: 1 }, tag: 'bloom', points: 200, lore: 'Seedlings sleep under glass.' },
  { id: 'belltower', name: 'Bell Tower', on: 'r', need: { g: 4 }, tag: 'earth', points: 150, lore: 'Rings in every new season.' },
  { id: 'gazebo', name: 'Gazebo', on: 'm', need: { m: 4 }, tag: 'bloom', points: 150, lore: 'A shady spot among the flowers.' },
  { id: 'maypole', name: 'Maypole', on: 'g', need: { m: 3 }, season: 'spring', tag: 'season', points: 250, lore: 'Ribbons dance only in spring.' },
  { id: 'well', name: 'Wishing Well', on: 'r', need: { m: 2, w: 1 }, tag: 'water', points: 200, lore: 'Toss a coin, make a wish.' },
  { id: 'stones', name: 'Standing Stones', on: 'r', need: { r: 4 }, tag: 'earth', points: 200, lore: 'Older than the island itself.' },
  { id: 'campfire', name: 'Campfire', on: 's', need: { f: 2 }, tag: 'earth', points: 150, lore: 'Crackles where forest meets shore.' },
  { id: 'sundial', name: 'Sundial', on: 's', need: { g: 3 }, season: 'summer', tag: 'season', points: 250, lore: 'Casts long shadows in summer.' },
  { id: 'snowman', name: 'Snowman', on: 'g', need: { r: 2, f: 2 }, season: 'winter', tag: 'season', points: 250, lore: 'Appears with the first snow.' },
  { id: 'beehive', name: 'Beehive', on: 'm', need: { f: 2 }, tag: 'bloom', points: 150, lore: 'Buzzing at the forest edge.' },
  { id: 'kite', name: 'Kite Hill', on: 'g', need: { r: 3 }, tag: 'earth', points: 150, lore: 'Windy enough for a kite.' },
  { id: 'totem', name: 'Zesto Totem', on: 'f', need: { r: 2, m: 2, c: 1 }, tag: 'bloom', points: 500, lore: 'Carved by the very first Zesto.' },
]

export const LANDMARK_BY_ID = Object.fromEntries(LANDMARKS.map((l) => [l.id, l])) as Record<LandmarkId, LandmarkDef>

export function isLandmarkId(value: unknown): value is LandmarkId {
  return typeof value === 'string' && value in LANDMARK_BY_ID
}

export function recipeText(def: LandmarkDef) {
  const parts = (Object.entries(def.need) as [TileId, number][]).map(([t, n]) => `${n}+ ${TILE_BY_ID[t].name}`)
  const when = def.season ? ` during ${SEASON_BY_ID[def.season].name}` : ''
  return `A ${TILE_BY_ID[def.on].name} tile touching ${parts.join(' and ')}${when}`
}

export type WonderId = 'harvest' | 'spring' | 'harbour' | 'winter' | 'midsummer' | 'jamboree'

export type WonderDef = { id: WonderId; name: string; landmarks: [LandmarkId, LandmarkId, LandmarkId]; points: number }

export const WONDERS: WonderDef[] = [
  { id: 'harvest', name: 'Harvest Festival', landmarks: ['windmill', 'scarecrow', 'glasshouse'], points: 1000 },
  { id: 'spring', name: 'Spring Fair', landmarks: ['belltower', 'gazebo', 'maypole'], points: 1000 },
  { id: 'harbour', name: 'Moonlit Harbour', landmarks: ['lighthouse', 'shrine', 'well'], points: 1000 },
  { id: 'winter', name: 'Winter Lights', landmarks: ['hotspring', 'snowman', 'treehouse'], points: 1000 },
  { id: 'midsummer', name: 'Midsummer Night', landmarks: ['stones', 'campfire', 'sundial'], points: 1000 },
  { id: 'jamboree', name: 'Zesto Jamboree', landmarks: ['kite', 'beehive', 'totem'], points: 1500 },
]

export const WONDER_BY_ID = Object.fromEntries(WONDERS.map((w) => [w.id, w])) as Record<WonderId, WonderDef>

export type SpiritId = 'wisp' | 'fox' | 'koi' | 'stag' | 'dawnbird'

export type SpiritDef = { id: SpiritId; name: string; rarity: string; points: number; weight: number; color: string }

export const SPIRITS: SpiritDef[] = [
  { id: 'wisp', name: 'Firefly Wisp', rarity: 'Common', points: 60, weight: 55, color: '#fff3a8' },
  { id: 'fox', name: 'Lantern Fox', rarity: 'Uncommon', points: 150, weight: 26, color: '#ffc27a' },
  { id: 'koi', name: 'Moon Koi', rarity: 'Rare', points: 400, weight: 12, color: '#9fe7ff' },
  { id: 'stag', name: 'Light Stag', rarity: 'Epic', points: 900, weight: 5, color: '#c8b6ff' },
  { id: 'dawnbird', name: 'The Dawn Bird', rarity: 'Legendary', points: 2500, weight: 2, color: '#ffe08a' },
]

export const SPIRIT_BY_ID = Object.fromEntries(SPIRITS.map((s) => [s.id, s])) as Record<SpiritId, SpiritDef>

export const SPIRIT_MIN_LANDMARKS = 3

export type Perk =
  | { kind: 'tag'; tag: LandmarkTag; percent: number }
  | { kind: 'wonder'; percent: number }
  | { kind: 'spirit'; percent: number }
  | { kind: 'seeds'; amount: number }
  | { kind: 'lantern'; multiplier: number }

export const PERKS: Record<CharacterId, { title: string; label: string; perk: Perk }> = {
  blu: { title: 'Tide Keeper', label: '+25% on water landmarks', perk: { kind: 'tag', tag: 'water', percent: 25 } },
  sage: { title: 'Stone Scholar', label: '+25% on earth landmarks', perk: { kind: 'tag', tag: 'earth', percent: 25 } },
  frost: { title: 'Season Whisperer', label: '+30% on seasonal landmarks', perk: { kind: 'tag', tag: 'season', percent: 30 } },
  shade: { title: 'Night Wanderer', label: '+20% on Spirits of Light', perk: { kind: 'spirit', percent: 20 } },
  blaze: { title: 'Festival Host', label: '+25% on Wonders', perk: { kind: 'wonder', percent: 25 } },
  sprout: { title: 'Green Thumb', label: '+25% on bloom landmarks', perk: { kind: 'tag', tag: 'bloom', percent: 25 } },
  royal: { title: 'Grand Gardener', label: '+10 max seeds', perk: { kind: 'seeds', amount: 10 } },
  rosie: { title: 'Heart of the Isle', label: '2x lantern points', perk: { kind: 'lantern', multiplier: 2 } },
}

export const SEEDS_MAX = 40
export const SEED_REGEN_MS = 90 * 1000
export const SEED_POUCH = 30
export const PLACE_POINTS = 1
export const LANTERN_POINTS = 15
export const CHECKIN_SEEDS = 15

export function checkinPoints(streak: number) {
  return 20 + 10 * (Math.min(Math.max(streak, 1), 7) - 1)
}

export function maxSeeds(character: CharacterId) {
  const { perk } = PERKS[character]
  return SEEDS_MAX + (perk.kind === 'seeds' ? perk.amount : 0)
}

export function landmarkPoints(def: LandmarkDef, character: CharacterId) {
  const { perk } = PERKS[character]
  const bonus = perk.kind === 'tag' && perk.tag === def.tag ? perk.percent : 0
  return Math.round(def.points * (1 + bonus / 100))
}

export function wonderPoints(def: WonderDef, character: CharacterId) {
  const { perk } = PERKS[character]
  return Math.round(def.points * (1 + (perk.kind === 'wonder' ? perk.percent : 0) / 100))
}

export function spiritPoints(def: SpiritDef, character: CharacterId) {
  const { perk } = PERKS[character]
  return Math.round(def.points * (1 + (perk.kind === 'spirit' ? perk.percent : 0) / 100))
}

export function lanternPoints(character: CharacterId) {
  const { perk } = PERKS[character]
  return LANTERN_POINTS * (perk.kind === 'lantern' ? perk.multiplier : 1)
}

export const HABITAT_FEES = {
  seeds: 50,
  hint: 25,
  summon: 100,
  expand: { 3: 150, 4: 300, 5: 500 } as Record<number, number>,
}
