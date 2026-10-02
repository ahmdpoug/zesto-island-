'use client'

import { ArrowRight, Flame, Landmark } from 'lucide-react'
import { CharacterAvatar } from '@/components/game/character-avatar'
import { Panel } from '@/components/game/panel'
import { useIslands } from '@/hooks/use-habitat'
import { shortAddress } from '@/lib/zesto/config'

export function VisitPanel({
  me,
  mode,
  onVisit,
  onClose,
}: {
  me: string
  mode: 'visit' | 'ranks'
  onVisit: (wallet: string) => void
  onClose: () => void
}) {
  const { data, error, isLoading } = useIslands()
  const list = data?.islands ?? []
  const shown = mode === 'visit' ? list.filter((i) => i.wallet !== me) : list

  return (
    <Panel
      title={mode === 'visit' ? 'Visit islands' : 'Top islands'}
      subtitle={mode === 'visit' ? 'Light a lantern on a neighbour’s island once a day. You both earn points.' : 'Ranked by total points earned.'}
      onClose={onClose}
    >
      {isLoading ? (
        <ul className="flex flex-col gap-2" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
          ))}
        </ul>
      ) : error ? (
        <p className="text-sm text-destructive">Could not load islands. Try again shortly.</p>
      ) : shown.length === 0 ? (
        <p className="rounded-2xl bg-secondary p-4 text-center text-sm text-muted-foreground">
          No other islands yet. Invite a friend to start theirs.
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {shown.map((island, i) => {
            const mine = island.wallet === me
            return (
              <li key={island.wallet}>
                <button
                  type="button"
                  disabled={mine}
                  onClick={() => onVisit(island.wallet)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border p-3 text-left transition hover:bg-secondary disabled:hover:bg-transparent"
                >
                  {mode === 'ranks' ? (
                    <span className="w-6 shrink-0 text-center font-display text-sm font-bold tabular-nums text-muted-foreground">{i + 1}</span>
                  ) : null}
                  <CharacterAvatar id={island.character} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-semibold">{mine ? 'Your island' : shortAddress(island.wallet)}</p>
                    <p className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Landmark className="size-3" aria-hidden="true" />
                        {island.discovered}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="size-3" aria-hidden="true" />
                        {island.lanterns}
                      </span>
                    </p>
                  </div>
                  <span className="font-display text-sm font-bold tabular-nums text-primary">{island.totalPoints.toLocaleString()}</span>
                  {!mine ? <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /> : null}
                </button>
              </li>
            )
          })}
        </ol>
      )}
    </Panel>
  )
}
