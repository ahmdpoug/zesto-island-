'use client'

import { ExternalLink, LoaderCircle, Maximize2, ScrollText, Sparkles, Sprout } from 'lucide-react'
import { Panel } from '@/components/game/panel'
import { HABITAT_FEES, MAX_RADIUS, SEED_POUCH, SEED_REGEN_MS, SPIRIT_MIN_LANDMARKS } from '@/lib/habitat/data'
import type { PayStage } from '@/hooks/use-habitat'
import { BUY_URL } from '@/lib/zesto/config'

export type ShopItem = 'seeds' | 'hint' | 'expand' | 'summon'

const STAGE_LABEL: Record<PayStage, string> = {
  quoting: 'Checking price…',
  paying: 'Confirm in wallet…',
  confirming: 'Confirming on-chain…',
  applying: 'Applying…',
}

export function ShopPanel({
  balance,
  radius,
  landmarks,
  busy,
  stage,
  onBuy,
  onClose,
}: {
  balance: number | null
  radius: number
  landmarks: number
  busy: ShopItem | null
  stage: PayStage | null
  onBuy: (item: ShopItem) => void
  onClose: () => void
}) {
  const nextRadius = radius + 1
  const items: { id: ShopItem; icon: typeof Sprout; title: string; body: string; price: number | null; disabled?: string }[] = [
    {
      id: 'seeds',
      icon: Sprout,
      title: 'Seed pouch',
      body: `+${SEED_POUCH} seeds right now. Seeds also regrow for free, one every ${SEED_REGEN_MS / 1000}s.`,
      price: HABITAT_FEES.seeds,
    },
    {
      id: 'hint',
      icon: ScrollText,
      title: 'Recipe scroll',
      body: 'Reveals the exact tile pattern for a random landmark you have not found.',
      price: HABITAT_FEES.hint,
    },
    {
      id: 'expand',
      icon: Maximize2,
      title: nextRadius > MAX_RADIUS ? 'Island fully grown' : `Expand to ring ${nextRadius}`,
      body: nextRadius > MAX_RADIUS ? 'Your island is as big as it gets.' : `Raise ${nextRadius * 6} new tiles from the sea for more landmarks.`,
      price: nextRadius > MAX_RADIUS ? null : HABITAT_FEES.expand[nextRadius],
      disabled: nextRadius > MAX_RADIUS ? 'Maxed' : undefined,
    },
    {
      id: 'summon',
      icon: Sparkles,
      title: 'Summon a spirit',
      body: 'Call a Spirit of Light to your island now. Rarer spirits are worth far more points.',
      price: HABITAT_FEES.summon,
      disabled: landmarks < SPIRIT_MIN_LANDMARKS ? `Needs ${SPIRIT_MIN_LANDMARKS} landmarks` : undefined,
    },
  ]

  return (
    <Panel title="Island Shop" subtitle="Spend $ZESTO to grow faster. Every purchase is paid on-chain." onClose={onClose}>
      <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-secondary px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">Your balance</p>
          <p className="font-display text-xl font-bold tabular-nums">
            {balance === null ? '…' : Math.floor(balance).toLocaleString()} <span className="text-sm text-primary">$ZESTO</span>
          </p>
        </div>
        <a
          href={BUY_URL}
          target="_blank"
          rel="noreferrer"
          className="flex h-9 items-center gap-1.5 rounded-full bg-popover px-3 text-xs font-semibold transition hover:brightness-110"
        >
          Get $ZESTO
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </div>

      <ul className="flex flex-col gap-2">
        {items.map(({ id, icon: Icon, title, body, price, disabled }) => {
          const active = busy === id
          const short = balance !== null && price !== null && balance < price
          return (
            <li key={id} className="flex items-center gap-3 rounded-2xl border border-border p-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-primary" aria-hidden="true">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground text-pretty">{body}</p>
              </div>
              <button
                type="button"
                onClick={() => onBuy(id)}
                disabled={!!busy || !!disabled || short}
                className="btn-primary flex h-10 min-w-20 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 font-display text-sm font-bold disabled:opacity-50 disabled:saturate-50"
              >
                {active ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
                {active && stage ? <span className="sr-only">{STAGE_LABEL[stage]}</span> : null}
                {disabled ?? (price === null ? '' : `${price}`)}
              </button>
            </li>
          )
        })}
      </ul>
      {busy && stage ? (
        <p className="mt-3 text-center text-xs text-muted-foreground" role="status">
          {STAGE_LABEL[stage]}
        </p>
      ) : null}
    </Panel>
  )
}
