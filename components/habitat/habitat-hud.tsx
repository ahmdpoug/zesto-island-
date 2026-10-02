'use client'

import { Sprout, Star } from 'lucide-react'
import { CharacterAvatar } from '@/components/game/character-avatar'
import { WalletButton } from '@/components/game/wallet-button'
import type { SeasonDef } from '@/lib/habitat/data'
import type { CharacterId } from '@/lib/zesto/config'

function formatLeft(ms: number) {
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return h > 0 ? `${h}h ${m}m` : `${Math.max(m, 1)}m`
}

export function HabitatHud({
  character,
  points,
  seeds,
  maxSeeds,
  season,
  seasonLeftMs,
  onOpenShop,
}: {
  character: CharacterId
  points: number
  seeds: number
  maxSeeds: number
  season: SeasonDef
  seasonLeftMs: number
  onOpenShop: () => void
}) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex items-start justify-between gap-2">
        <div className="glass pointer-events-auto flex h-10 items-center gap-2 rounded-full pl-1 pr-3">
          <CharacterAvatar id={character} size={32} />
          <span className="flex items-center gap-1 font-display text-sm font-bold tabular-nums">
            <Star className="size-3.5 fill-primary text-primary" aria-hidden="true" />
            {points.toLocaleString()}
            <span className="sr-only">points</span>
          </span>
        </div>
        <div className="pointer-events-auto">
          <WalletButton onOpenProfile={onOpenShop} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p
          className="glass pointer-events-auto flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold"
          aria-label={`${season.name}, changes in ${formatLeft(seasonLeftMs)}`}
        >
          <span className="size-2 rounded-full" style={{ background: season.accent }} aria-hidden="true" />
          {season.name}
          <span className="font-normal text-muted-foreground">{formatLeft(seasonLeftMs)}</span>
        </p>
        <button
          type="button"
          onClick={onOpenShop}
          className="glass pointer-events-auto flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold tabular-nums"
        >
          <Sprout className="size-3.5 text-[#8fd16a]" aria-hidden="true" />
          {`${seeds} / ${maxSeeds}`}
          <span className="sr-only">seeds, open shop</span>
        </button>
      </div>
    </header>
  )
}
