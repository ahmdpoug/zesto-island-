'use client'

import { BookOpen, CalendarCheck, Globe, ShoppingBag, Trophy } from 'lucide-react'
import { TILES, type SeasonId, type TileId } from '@/lib/habitat/data'
import { cn } from '@/lib/utils'

export type HabitatPanel = 'codex' | 'shop' | 'visit' | 'ranks'

export function TilePalette({
  selected,
  season,
  onSelect,
  onOpen,
  onCheckin,
  canCheckin,
  checkinPoints,
}: {
  selected: TileId
  season: SeasonId
  onSelect: (tile: TileId) => void
  onOpen: (panel: HabitatPanel) => void
  onCheckin: () => void
  canCheckin: boolean
  checkinPoints: number
}) {
  const actions = [
    { id: 'codex' as const, label: 'Codex', icon: BookOpen },
    { id: 'shop' as const, label: 'Shop', icon: ShoppingBag },
    { id: 'visit' as const, label: 'Visit', icon: Globe },
    { id: 'ranks' as const, label: 'Ranks', icon: Trophy },
  ]

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <nav aria-label="Island menu" className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {actions.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onOpen(id)}
              className="glass grid size-11 place-items-center rounded-2xl transition active:scale-95"
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="sr-only">{label}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onCheckin}
          disabled={!canCheckin}
          className={cn(
            'flex h-11 items-center gap-1.5 rounded-2xl px-3 font-display text-sm font-bold transition active:scale-95',
            canCheckin ? 'btn-primary' : 'glass text-muted-foreground',
          )}
        >
          <CalendarCheck className="size-4" aria-hidden="true" />
          {canCheckin ? `+${checkinPoints}` : 'Done'}
          <span className="sr-only">{canCheckin ? 'Daily check-in' : 'Checked in today'}</span>
        </button>
      </nav>

      <div className="glass pointer-events-auto w-full max-w-md rounded-3xl p-1.5">
        <ul className="grid grid-cols-7 gap-1" role="radiogroup" aria-label="Tile to place">
          {TILES.map((t) => {
            const active = t.id === selected
            return (
              <li key={t.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onSelect(t.id)}
                  className={cn(
                    'flex w-full flex-col items-center gap-1 rounded-2xl py-1.5 transition',
                    active ? 'bg-secondary ring-2 ring-primary' : 'hover:bg-secondary/60',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="block size-7 [clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]"
                    style={{ background: t.colors[season] }}
                  />
                  <span className="text-[10px] font-semibold leading-none">{t.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
