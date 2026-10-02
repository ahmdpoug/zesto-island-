'use client'

import { Check, HelpCircle, Lock } from 'lucide-react'
import { useState } from 'react'
import { Panel } from '@/components/game/panel'
import {
  LANDMARKS,
  LANDMARK_BY_ID,
  SEASON_BY_ID,
  SPIRITS,
  SPIRIT_MIN_LANDMARKS,
  WONDERS,
  landmarkPoints,
  recipeText,
  spiritPoints,
  wonderPoints,
  type LandmarkId,
  type SpiritId,
  type WonderId,
} from '@/lib/habitat/data'
import type { CharacterId } from '@/lib/zesto/config'
import { cn } from '@/lib/utils'

type Tab = 'landmarks' | 'wonders' | 'spirits'

export function CodexPanel({
  character,
  discovered,
  wonders,
  hints,
  spirits,
  onClose,
  onBuyHint,
}: {
  character: CharacterId
  discovered: LandmarkId[]
  wonders: WonderId[]
  hints: LandmarkId[]
  spirits: SpiritId[]
  onClose: () => void
  onBuyHint: () => void
}) {
  const [tab, setTab] = useState<Tab>('landmarks')
  const found = new Set(discovered)
  const hinted = new Set(hints)
  const wonderSet = new Set(wonders)
  const seen = new Set(spirits)

  return (
    <Panel title="Island Codex" subtitle={`${found.size}/${LANDMARKS.length} landmarks · ${wonderSet.size}/${WONDERS.length} wonders`} onClose={onClose}>
      <div role="tablist" aria-label="Codex sections" className="mb-4 grid grid-cols-3 gap-1 rounded-2xl bg-secondary p-1">
        {(['landmarks', 'wonders', 'spirits'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn('h-9 rounded-xl text-sm font-semibold capitalize transition', tab === t ? 'bg-popover shadow' : 'text-muted-foreground')}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'landmarks' ? (
        <div className="flex flex-col gap-3">
          <ul className="flex flex-col gap-2">
            {LANDMARKS.map((l) => {
              const isFound = found.has(l.id)
              const known = isFound || hinted.has(l.id)
              return (
                <li key={l.id} className={cn('flex gap-3 rounded-2xl border border-border p-3', isFound && 'bg-secondary')}>
                  <span
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-xl',
                      isFound ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground',
                    )}
                    aria-hidden="true"
                  >
                    {isFound ? <Check className="size-4" /> : known ? <HelpCircle className="size-4" /> : <Lock className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-x-2 font-display text-sm font-semibold">
                      {known ? l.name : 'Unknown landmark'}
                      {l.season ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium" style={{ color: SEASON_BY_ID[l.season].accent }}>
                          {SEASON_BY_ID[l.season].name}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground text-pretty">
                      {known ? recipeText(l) : `A ${l.tag} landmark. Experiment, or buy a hint in the shop.`}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-primary">{`+${landmarkPoints(l, character)}`}</span>
                </li>
              )
            })}
          </ul>
          <button type="button" onClick={onBuyHint} className="h-11 rounded-2xl bg-secondary text-sm font-semibold transition hover:bg-secondary/80">
            Learn a random recipe
          </button>
        </div>
      ) : null}

      {tab === 'wonders' ? (
        <ul className="flex flex-col gap-2">
          {WONDERS.map((w) => {
            const done = wonderSet.has(w.id)
            return (
              <li key={w.id} className={cn('rounded-2xl border border-border p-3', done && 'bg-secondary')}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-sm font-semibold">{w.name}</p>
                  <span className="text-xs font-semibold tabular-nums text-primary">{`+${wonderPoints(w, character)}`}</span>
                </div>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {w.landmarks.map((id) => (
                    <li
                      key={id}
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[11px] font-medium',
                        found.has(id) ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {found.has(id) || hinted.has(id) ? LANDMARK_BY_ID[id].name : '???'}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">
                  {done ? 'Unlocked on your island.' : 'Have all three on your island at the same time.'}
                </p>
              </li>
            )
          })}
        </ul>
      ) : null}

      {tab === 'spirits' ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground text-pretty">
            {`Once your island has ${SPIRIT_MIN_LANDMARKS} landmarks, a spirit visits each time you check in. You can also summon one from the shop.`}
          </p>
          <ul className="grid grid-cols-2 gap-2">
            {SPIRITS.map((s) => (
              <li key={s.id} className="flex flex-col items-center gap-2 rounded-2xl border border-border p-3 text-center">
                <span
                  aria-hidden="true"
                  className="size-8 rounded-full"
                  style={{
                    background: seen.has(s.id) ? s.color : 'transparent',
                    boxShadow: seen.has(s.id) ? `0 0 24px ${s.color}` : undefined,
                    border: seen.has(s.id) ? undefined : '1px dashed var(--border)',
                  }}
                />
                <p className="font-display text-sm font-semibold leading-tight">{seen.has(s.id) ? s.name : '???'}</p>
                <p className="text-[11px] text-muted-foreground">{`${s.rarity} · +${spiritPoints(s, character)}`}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Panel>
  )
}
