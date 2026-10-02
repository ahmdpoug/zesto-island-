'use client'

import { ArrowRight, Check, LoaderCircle, PenLine, Sparkles, Wallet } from 'lucide-react'
import { BUY_URL, POINTS_POOL_PERCENT, shortAddress } from '@/lib/zesto/config'
import { FeatureGrid, HowItWorks, StatsStrip } from './landing-sections'

type Step = 'connect' | 'sign' | 'loading'

export function Onboarding({
  step,
  address,
  busy,
  onConnect,
  onSign,
}: {
  step: Step
  address?: string
  busy: boolean
  onConnect: () => void
  onSign: () => void
}) {
  return (
    <div className="absolute inset-0 z-40 overflow-y-auto overscroll-contain">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,rgb(9_14_26/0.15),rgb(7_11_20/0.78)_55%,rgb(6_9_17/0.97)_100%)]"
      />

      <div className="relative mx-auto flex min-h-full w-full max-w-6xl flex-col px-5 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8">
        <header className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg btn-primary font-display text-sm font-extrabold">Z</span>
            <span className="font-display text-base font-bold tracking-tight">Zesto Dig</span>
          </div>
          <nav aria-label="Primary" className="flex items-center gap-1">
            <a
              href={BUY_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden h-9 items-center rounded-full px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              Get $ZESTO
            </a>
            {step === 'connect' ? (
              <button
                type="button"
                onClick={onConnect}
                className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-secondary px-4 text-sm font-semibold backdrop-blur transition-colors hover:bg-secondary/80"
              >
                <Wallet className="size-4" aria-hidden="true" />
                Connect
              </button>
            ) : null}
          </nav>
        </header>

        <section className="flex flex-col items-center gap-6 pb-12 pt-[6vh] text-center sm:gap-8 sm:pt-[16vh]">
          <div className="flex animate-fade-up flex-col items-center gap-4 sm:gap-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
              <Sparkles className="size-3.5" aria-hidden="true" />
              {`${POINTS_POOL_PERCENT}% of supply reserved for players`}
            </p>
            <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tighter text-balance sm:text-7xl lg:text-8xl">
              Dig. Build.
              <br />
              <span className="bg-gradient-to-b from-[#ffe0ad] via-[#ffb35c] to-[#ff8a2a] bg-clip-text text-transparent">
                Own the island.
              </span>
            </h1>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
              An on-chain treasure hunt where every dig, harvest and build earns points toward the $ZESTO launch.
            </p>
          </div>

          <div className="w-full max-w-sm animate-fade-up [animation-delay:120ms]">
            <AuthCard step={step} address={address} busy={busy} onConnect={onConnect} onSign={onSign} />
          </div>
        </section>

        <div className="flex flex-col gap-20 pb-8">
          <StatsStrip />
          <FeatureGrid />
          <HowItWorks />
        </div>

        <footer className="mt-auto flex flex-col items-center gap-4 pt-8">
          <div className="hairline w-full" />
          <p className="text-xs text-muted-foreground">{'Zesto Dig · Testnet season · Points are not a promise of value'}</p>
        </footer>
      </div>
    </div>
  )
}

function AuthCard({
  step,
  address,
  busy,
  onConnect,
  onSign,
}: {
  step: Step
  address?: string
  busy: boolean
  onConnect: () => void
  onSign: () => void
}) {
  const current = step === 'connect' ? 0 : 1

  return (
    <div className="glass flex flex-col gap-4 rounded-3xl p-2">
      <ol className="flex items-center gap-2 px-3 pt-3 text-xs" aria-label="Sign in progress">
        {['Connect wallet', 'Verify'].map((label, i) => {
          const done = i < current || step === 'loading'
          const active = i === current && step !== 'loading'
          return (
            <li key={label} className="flex flex-1 items-center gap-2" aria-current={active ? 'step' : undefined}>
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                  done ? 'bg-accent text-accent-foreground' : active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {done ? <Check className="size-3" aria-hidden="true" /> : i + 1}
              </span>
              <span className={active || done ? 'font-medium text-foreground' : 'text-muted-foreground'}>{label}</span>
              {i === 0 ? <span className="h-px flex-1 bg-border" aria-hidden="true" /> : null}
            </li>
          )
        })}
      </ol>

      {step === 'loading' ? (
        <div className="flex h-12 items-center justify-center gap-2 text-sm text-muted-foreground" role="status">
          <LoaderCircle className="size-4 animate-spin text-primary" aria-hidden="true" />
          Loading your homestead…
        </div>
      ) : (
        <button
          type="button"
          onClick={step === 'connect' ? onConnect : onSign}
          disabled={busy}
          className="btn-primary group flex h-13 w-full items-center justify-center gap-2 rounded-2xl font-display text-base font-bold disabled:opacity-70"
        >
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : step === 'connect' ? (
            <Wallet className="size-4" aria-hidden="true" />
          ) : (
            <PenLine className="size-4" aria-hidden="true" />
          )}
          {busy ? 'Waiting for signature…' : step === 'connect' ? 'Start playing' : 'Sign in with wallet'}
          {!busy ? <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /> : null}
        </button>
      )}

      <p className="px-3 pb-3 text-center text-xs text-muted-foreground text-pretty">
        {step === 'sign'
          ? `Sign a free message with ${address ? shortAddress(address) : 'your wallet'}. No gas, no funds moved.`
          : 'Free to start. Gather and build without spending a token.'}
      </p>
    </div>
  )
}
