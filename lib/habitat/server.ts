import { randomInt } from 'node:crypto'
import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { islands, lanterns, players, pointsLog } from '@/lib/db/schema'
import { CHARACTER_BY_ID, isCharacterId, type CharacterId } from '@/lib/zesto/config'
import type { PointSource } from '@/lib/zesto/economy'
import { GameError, addPoints, utcDay, type Executor } from '@/lib/zesto/server'
import {
  CHECKIN_SEEDS,
  HABITAT_FEES,
  LANDMARK_BY_ID,
  LANDMARKS,
  MAX_RADIUS,
  PLACE_POINTS,
  SEED_POUCH,
  SEED_REGEN_MS,
  SPIRITS,
  SPIRIT_BY_ID,
  SPIRIT_MIN_LANDMARKS,
  STARTER_TILES,
  START_RADIUS,
  WONDER_BY_ID,
  checkinPoints,
  isTileId,
  landmarkPoints,
  lanternPoints,
  maxSeeds,
  seasonAt,
  spiritPoints,
  wonderPoints,
  type LandmarkId,
  type SpiritId,
  type WonderId,
} from './data'
import { HEXES, TILE_COUNT } from './hex'
import { activeWonders, computeLandmarks } from './rules'
import type { HabitatAction, HabitatOutcome, HabitatState, PublicIsland, SpiritVisit } from './types'

type IslandRow = typeof islands.$inferSelect

const SPIRIT_HISTORY = 12
const OWNER_LANTERN_POINTS = 5

export function parseHabitatAction(body: Record<string, unknown> | null): HabitatAction {
  switch (body?.type) {
    case 'place': {
      const index = Number(body.index)
      if (!Number.isInteger(index) || index < 0 || index >= TILE_COUNT) throw new GameError('Pick a tile on your island')
      if (!isTileId(body.tile)) throw new GameError('Unknown tile type')
      return { type: 'place', index, tile: body.tile }
    }
    case 'checkin':
    case 'seeds':
    case 'hint':
    case 'expand':
    case 'summon':
      return { type: body.type }
    case 'lantern': {
      const owner = typeof body.owner === 'string' ? body.owner.toLowerCase() : ''
      if (!/^0x[0-9a-f]{40}$/.test(owner)) throw new GameError('Unknown island')
      return { type: 'lantern', owner }
    }
    default:
      throw new GameError('Unknown action')
  }
}

function seedsNow(island: IslandRow, max: number, now: Date) {
  if (island.seeds >= max) return { seeds: island.seeds, anchor: now, next: null as Date | null }
  const elapsed = Math.max(0, now.getTime() - island.seedsAt.getTime())
  const regen = Math.floor(elapsed / SEED_REGEN_MS)
  const seeds = Math.min(max, island.seeds + regen)
  if (seeds >= max) return { seeds, anchor: now, next: null }
  const anchor = new Date(island.seedsAt.getTime() + regen * SEED_REGEN_MS)
  return { seeds, anchor, next: new Date(anchor.getTime() + SEED_REGEN_MS) }
}

async function getPlayer(tx: Executor, wallet: string) {
  const [player] = await tx.select().from(players).where(eq(players.wallet, wallet)).limit(1)
  if (!player || !isCharacterId(player.character)) throw new GameError('Choose your Zesto first', 403)
  return { ...player, character: player.character as CharacterId }
}

async function lockIsland(tx: Executor, wallet: string) {
  await tx
    .insert(islands)
    .values({ wallet, tiles: STARTER_TILES, radius: START_RADIUS, discovered: [], wonders: [], hints: [], spirits: [] })
    .onConflictDoNothing({ target: islands.wallet })
  const [island] = await tx.select().from(islands).where(eq(islands.wallet, wallet)).for('update').limit(1)
  return island
}

async function award(tx: Executor, wallet: string, source: PointSource, points: number, detail: string) {
  if (points <= 0) return
  await addPoints(tx, wallet, source, points, detail)
  await tx
    .update(players)
    .set({ totalPoints: sql`${players.totalPoints} + ${points}`, updatedAt: new Date() })
    .where(eq(players.wallet, wallet))
}

function rollSpirit(): SpiritId {
  const total = SPIRITS.reduce((s, x) => s + x.weight, 0)
  let roll = randomInt(total)
  for (const spirit of SPIRITS) {
    roll -= spirit.weight
    if (roll < 0) return spirit.id
  }
  return SPIRITS[0].id
}

function addSpirit(list: SpiritVisit[], id: SpiritId, now: Date) {
  return [{ id, at: now.toISOString() }, ...list].slice(0, SPIRIT_HISTORY)
}

export async function habitatFee(tx: Executor, wallet: string, action: HabitatAction) {
  switch (action.type) {
    case 'seeds':
      return HABITAT_FEES.seeds
    case 'hint':
      return HABITAT_FEES.hint
    case 'summon':
      return HABITAT_FEES.summon
    case 'expand': {
      const [row] = await tx.select({ radius: islands.radius }).from(islands).where(eq(islands.wallet, wallet)).limit(1)
      const next = (row?.radius ?? START_RADIUS) + 1
      if (next > MAX_RADIUS) throw new GameError('Your island is already as big as it gets')
      return HABITAT_FEES.expand[next]
    }
    default:
      return 0
  }
}

export async function performHabitat(tx: Executor, wallet: string, action: HabitatAction, now = new Date()): Promise<HabitatOutcome> {
  const player = await getPlayer(tx, wallet)
  const island = await lockIsland(tx, wallet)
  const max = maxSeeds(player.character)
  const { season } = seasonAt(now.getTime())
  const seeds = seedsNow(island, max, now)

  switch (action.type) {
    case 'place': {
      const hex = HEXES[action.index]
      if (hex.ring > island.radius) throw new GameError('Expand your island to build there')
      if (island.tiles[action.index] === action.tile) throw new GameError('That tile is already there')
      if (seeds.seeds < 1) throw new GameError('Out of seeds. They regrow over time, or grab a pouch in the shop.')

      const tiles = island.tiles.slice(0, action.index) + action.tile + island.tiles.slice(action.index + 1)
      const present = [...new Set(computeLandmarks(tiles, season.id).values())]
      const known = new Set(island.discovered)
      const newLandmarks = present.filter((id) => !known.has(id))
      const knownWonders = new Set(island.wonders)
      const newWonders = activeWonders(present).filter((id) => !knownWonders.has(id))

      let points = PLACE_POINTS
      await award(tx, wallet, 'place', PLACE_POINTS, 'Shaped the island')
      for (const id of newLandmarks) {
        const p = landmarkPoints(LANDMARK_BY_ID[id], player.character)
        points += p
        await award(tx, wallet, 'landmark', p, `Discovered ${LANDMARK_BY_ID[id].name}`)
      }
      for (const id of newWonders) {
        const p = wonderPoints(WONDER_BY_ID[id], player.character)
        points += p
        await award(tx, wallet, 'wonder', p, `Wonder: ${WONDER_BY_ID[id].name}`)
      }

      await tx
        .update(islands)
        .set({
          tiles,
          seeds: seeds.seeds - 1,
          seedsAt: seeds.next ? seeds.anchor : now,
          discovered: [...island.discovered, ...newLandmarks],
          wonders: [...island.wonders, ...newWonders],
          placements: island.placements + 1,
        })
        .where(eq(islands.wallet, wallet))

      const title = newWonders.length
        ? `Wonder unlocked: ${WONDER_BY_ID[newWonders[0]].name}`
        : newLandmarks.length
          ? `${LANDMARK_BY_ID[newLandmarks[0]].name} appeared!`
          : 'Tile placed'
      return { title, points, landmarks: newLandmarks, wonders: newWonders }
    }

    case 'checkin': {
      const today = utcDay(now)
      if (island.lastCheckin === today) throw new GameError('Already checked in today. Come back tomorrow!')
      const yesterday = utcDay(new Date(now.getTime() - 86_400_000))
      const streak = island.lastCheckin === yesterday ? island.streak + 1 : 1
      const p = checkinPoints(streak)
      await award(tx, wallet, 'checkin', p, `Day ${streak} check-in`)

      let spirits = island.spirits as SpiritVisit[]
      let spirit: SpiritId | undefined
      let spiritPts = 0
      if (island.discovered.length >= SPIRIT_MIN_LANDMARKS) {
        spirit = rollSpirit()
        spiritPts = spiritPoints(SPIRIT_BY_ID[spirit], player.character)
        spirits = addSpirit(spirits, spirit, now)
        await award(tx, wallet, 'spirit', spiritPts, `${SPIRIT_BY_ID[spirit].name} visited overnight`)
      }

      const refill = Math.min(max + SEED_POUCH, seeds.seeds + CHECKIN_SEEDS)
      await tx
        .update(islands)
        .set({ streak, lastCheckin: today, seeds: refill, seedsAt: now, spirits })
        .where(eq(islands.wallet, wallet))
      return {
        title: `Day ${streak} check-in`,
        description: spirit
          ? `+${CHECKIN_SEEDS} seeds, and a ${SPIRIT_BY_ID[spirit].name} drifted in overnight.`
          : `+${CHECKIN_SEEDS} seeds. Discover ${SPIRIT_MIN_LANDMARKS} landmarks to attract Spirits of Light.`,
        points: p + spiritPts,
        spirit,
      }
    }

    case 'seeds': {
      await tx
        .update(islands)
        .set({ seeds: seeds.seeds + SEED_POUCH, seedsAt: seeds.next ? seeds.anchor : now })
        .where(eq(islands.wallet, wallet))
      return { title: 'Seed pouch opened', description: `+${SEED_POUCH} seeds ready to plant.`, points: 0 }
    }

    case 'hint': {
      const pool = LANDMARKS.filter((l) => !island.discovered.includes(l.id) && !island.hints.includes(l.id))
      if (pool.length === 0) throw new GameError('You already know every recipe')
      const hint = pool[randomInt(pool.length)].id
      await tx
        .update(islands)
        .set({ hints: [...island.hints, hint] })
        .where(eq(islands.wallet, wallet))
      return { title: `Recipe learned: ${LANDMARK_BY_ID[hint].name}`, points: 0, hint }
    }

    case 'expand': {
      const radius = island.radius + 1
      if (radius > MAX_RADIUS) throw new GameError('Your island is already as big as it gets')
      await tx.update(islands).set({ radius }).where(eq(islands.wallet, wallet))
      return { title: 'Island expanded', description: `A new ring of ${radius * 6} tiles rose from the sea.`, points: 0 }
    }

    case 'summon': {
      if (island.discovered.length < SPIRIT_MIN_LANDMARKS) {
        throw new GameError(`Discover ${SPIRIT_MIN_LANDMARKS} landmarks before summoning spirits`)
      }
      const spirit = rollSpirit()
      const p = spiritPoints(SPIRIT_BY_ID[spirit], player.character)
      await award(tx, wallet, 'spirit', p, `Summoned ${SPIRIT_BY_ID[spirit].name}`)
      await tx
        .update(islands)
        .set({ spirits: addSpirit(island.spirits as SpiritVisit[], spirit, now) })
        .where(eq(islands.wallet, wallet))
      return { title: `${SPIRIT_BY_ID[spirit].name} arrived`, description: `${SPIRIT_BY_ID[spirit].rarity} Spirit of Light`, points: p, spirit }
    }

    case 'lantern': {
      if (action.owner === wallet) throw new GameError('Light lanterns on friends’ islands, not your own')
      const [owner] = await tx.select({ wallet: islands.wallet }).from(islands).where(eq(islands.wallet, action.owner)).limit(1)
      if (!owner) throw new GameError('That island does not exist yet', 404)
      const inserted = await tx
        .insert(lanterns)
        .values({ owner: action.owner, visitor: wallet, day: utcDay(now) })
        .onConflictDoNothing()
        .returning({ owner: lanterns.owner })
      if (inserted.length === 0) throw new GameError('You already lit a lantern here today')

      const p = lanternPoints(player.character)
      await award(tx, wallet, 'lantern', p, 'Lit a lantern for a neighbour')
      await award(tx, action.owner, 'lantern', OWNER_LANTERN_POINTS, 'A visitor lit a lantern')
      await tx
        .update(islands)
        .set({ lanterns: sql`${islands.lanterns} + 1` })
        .where(eq(islands.wallet, action.owner))
      return { title: 'Lantern lit', description: 'Your neighbour will see it glowing tonight.', points: p }
    }
  }
}

export async function loadHabitat(wallet: string, now = new Date()): Promise<HabitatState> {
  const [player] = await db.select().from(players).where(eq(players.wallet, wallet)).limit(1)
  if (!player || !isCharacterId(player.character)) {
    return { player: null, island: null, log: [], serverTime: now.toISOString() }
  }
  const character = player.character as CharacterId

  let [island] = await db.select().from(islands).where(eq(islands.wallet, wallet)).limit(1)
  if (!island) {
    ;[island] = await db
      .insert(islands)
      .values({ wallet, tiles: STARTER_TILES, radius: START_RADIUS, discovered: [], wonders: [], hints: [], spirits: [] })
      .onConflictDoNothing({ target: islands.wallet })
      .returning()
    if (!island) [island] = await db.select().from(islands).where(eq(islands.wallet, wallet)).limit(1)
  }

  const max = maxSeeds(character)
  const seeds = seedsNow(island, max, now)
  const log = await db
    .select({ id: pointsLog.id, source: pointsLog.source, points: pointsLog.points, detail: pointsLog.detail, createdAt: pointsLog.createdAt })
    .from(pointsLog)
    .where(eq(pointsLog.wallet, wallet))
    .orderBy(desc(pointsLog.id))
    .limit(12)

  const today = utcDay(now)
  const yesterday = utcDay(new Date(now.getTime() - 86_400_000))
  const nextStreak = island.lastCheckin === yesterday ? island.streak + 1 : island.lastCheckin === today ? island.streak : 1

  return {
    player: { wallet, character, totalPoints: player.totalPoints },
    island: {
      tiles: island.tiles,
      radius: island.radius,
      seeds: seeds.seeds,
      maxSeeds: max,
      nextSeedAt: seeds.next?.toISOString() ?? null,
      discovered: island.discovered as LandmarkId[],
      wonders: island.wonders as WonderId[],
      hints: island.hints as LandmarkId[],
      spirits: island.spirits as SpiritVisit[],
      lanterns: island.lanterns,
      placements: island.placements,
      streak: island.streak,
      checkedInToday: island.lastCheckin === today,
      nextCheckinPoints: checkinPoints(nextStreak),
    },
    log: log.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() })),
    serverTime: now.toISOString(),
  }
}

export async function listIslands(limit = 24): Promise<PublicIsland[]> {
  const rows = await db
    .select({
      wallet: islands.wallet,
      character: players.character,
      totalPoints: players.totalPoints,
      tiles: islands.tiles,
      radius: islands.radius,
      spirits: islands.spirits,
      lanterns: islands.lanterns,
      discovered: islands.discovered,
      wonders: islands.wonders,
    })
    .from(islands)
    .innerJoin(players, eq(players.wallet, islands.wallet))
    .orderBy(desc(players.totalPoints), islands.createdAt)
    .limit(limit)
  return rows.filter((r) => isCharacterId(r.character)).map(toPublic)
}

export async function getIsland(wallet: string): Promise<PublicIsland | null> {
  const [row] = await db
    .select({
      wallet: islands.wallet,
      character: players.character,
      totalPoints: players.totalPoints,
      tiles: islands.tiles,
      radius: islands.radius,
      spirits: islands.spirits,
      lanterns: islands.lanterns,
      discovered: islands.discovered,
      wonders: islands.wonders,
    })
    .from(islands)
    .innerJoin(players, eq(players.wallet, islands.wallet))
    .where(eq(islands.wallet, wallet))
    .limit(1)
  return row && isCharacterId(row.character) ? toPublic(row) : null
}

export async function litToday(owner: string, visitor: string, now = new Date()) {
  const [row] = await db
    .select({ owner: lanterns.owner })
    .from(lanterns)
    .where(and(eq(lanterns.owner, owner), eq(lanterns.visitor, visitor), eq(lanterns.day, utcDay(now))))
    .limit(1)
  return !!row
}

function toPublic(row: {
  wallet: string
  character: string
  totalPoints: number
  tiles: string
  radius: number
  spirits: unknown
  lanterns: number
  discovered: unknown
  wonders: unknown
}): PublicIsland {
  return {
    wallet: row.wallet,
    character: row.character as CharacterId,
    totalPoints: row.totalPoints,
    tiles: row.tiles,
    radius: row.radius,
    spirits: (row.spirits as SpiritVisit[]).slice(0, 6),
    lanterns: row.lanterns,
    discovered: (row.discovered as string[]).length,
    wonders: row.wonders as WonderId[],
  }
}

export function characterName(id: CharacterId) {
  return CHARACTER_BY_ID[id].name
}
