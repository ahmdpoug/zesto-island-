'use client'

import { Sparkles } from 'lucide-react'
import { useEffect } from 'react'
import { LANDMARK_BY_ID, SPIRIT_BY_ID, WONDER_BY_ID } from '@/lib/habitat/data'
import type { HabitatOutcome } from '@/lib/habitat/types'

export function DiscoveryCard({ outcome, onClose }: { outcome: HabitatOutcome; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [onClose])

  const wonder = outcome.wonders?.[0] ? WONDER_BY_ID[outcome.wonders[0]] : null
  const landmark = outcome.landmarks?.[0] ? LANDMARK_BY_ID[outcome.landmarks[0]] : null
  const spirit = outcome.spirit ? SPIRIT_BY_ID[outcome.spirit] : null
  const eyebrow = wonder ? 'Wonder unlocked' : landmark ? 'New landmark' : spirit ? `${spirit.rarity} spirit` : 'Discovery'
  const name = wonder?.name ?? landmark?.name ?? spirit?.name ?? outcome.title
  const lore = wonder ? 'Three landmarks gathered in harmony.' : (landmark?.lore ?? outcome.description)

  return (
    <div className="pointer-events-none absolute inset-x-0 top-28 z-30 flex justify-center px-4" role="status" aria-live="polite">
      <button
        type="button"
        onClick={onClose}
        className="glass pointer-events-auto flex w-full max-w-xs animate-fade-up flex-col items-center gap-1 rounded-3xl px-5 py-4 text-center"
        style={spirit ? { boxShadow: `0 0 60px -10px ${spirit.color}` } : undefined}
      >
        <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
          <Sparkles className="size-3.5" aria-hidden="true" />
          {eyebrow}
        </span>
        <span className="font-display text-2xl font-bold leading-tight text-balance">{name}</span>
        {lore ? <span className="text-sm text-muted-foreground text-pretty">{lore}</span> : null}
        <span className="mt-1 font-display text-lg font-bold tabular-nums text-accent">{`+${outcome.points} pts`}</span>
        <span className="sr-only">Dismiss</span>
      </button>
    </div>
  )
}
