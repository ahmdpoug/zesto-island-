import { Coins, Flame, Landmark, Leaf, ShieldCheck, Snowflake, Sparkles, Trophy } from 'lucide-react'
import { POINTS_POOL_PERCENT, POINTS_POOL_TOKENS } from '@/lib/zesto/config'
import { LANDMARKS, WONDERS } from '@/lib/habitat/data'

const FEATURES = [
  { icon: Leaf, title: 'Shape your island', body: 'Paint grass, forest, meadow, farm, sand, rock and water onto a tiny hex island using free, regrowing seeds.' },
  { icon: Landmark, title: `Discover ${LANDMARKS.length} landmarks`, body: 'Arrange tiles in the right pattern and a windmill, shrine or lighthouse appears. Every first discovery earns points.' },
  { icon: Trophy, title: `Unlock ${WONDERS.length} Wonders`, body: 'Gather three themed landmarks together to trigger a festival Wonder worth up to 1,500 points.' },
  { icon: Snowflake, title: 'Live seasons', body: 'The whole world shifts from spring to winter each day. Some landmarks only appear in one season.' },
  { icon: Sparkles, title: 'Spirits of Light', body: 'Grow a lively island to attract glowing spirits, from common wisps to the legendary Dawn Bird.' },
  { icon: Flame, title: 'Visit neighbours', body: 'Tour other islands and light a lantern each day. You both earn points for every visit.' },
]

const STEPS = [
  { n: '01', title: 'Connect', body: 'Log in with your wallet or email in seconds.' },
  { n: '02', title: 'Verify', body: 'Sign a free message. No gas, no funds moved.' },
  { n: '03', title: 'Grow & earn', body: 'Every tile, landmark and spirit earns points.' },
]

function compact(n: number) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

export function StatsStrip() {
  const stats = [
    { label: 'Points pool', value: `${POINTS_POOL_PERCENT}%`, hint: 'of total supply' },
    { label: 'Tokens to players', value: compact(POINTS_POOL_TOKENS), hint: '$ZESTO at TGE' },
    { label: 'Landmarks', value: String(LANDMARKS.length), hint: 'to discover' },
  ]
  return (
    <dl className="glass grid grid-cols-3 divide-x divide-border/60 rounded-2xl">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col gap-1 px-3 py-4 text-center sm:px-6">
          <dt className="order-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px]">
            {s.label}
          </dt>
          <dd className="order-1 font-display text-xl font-bold tabular-nums tracking-tight sm:text-3xl">{s.value}</dd>
          <dd className="order-3 hidden text-xs text-muted-foreground/80 sm:block">{s.hint}</dd>
        </div>
      ))}
    </dl>
  )
}

export function FeatureGrid() {
  return (
    <section aria-labelledby="features-title" className="flex flex-col gap-6">
      <SectionHeading eyebrow="Gameplay" id="features-title" title="One island. Endless ways to earn." />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <li
            key={f.title}
            className="glass group flex flex-col gap-3 rounded-2xl p-5 transition-colors hover:border-primary/30"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
              <f.icon className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="font-display text-base font-semibold tracking-tight">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{f.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="flex flex-col gap-6">
      <SectionHeading eyebrow="Get started" id="how-title" title="Start playing in under a minute." />
      <ol className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((s) => (
          <li key={s.n} className="glass flex flex-col gap-2 rounded-2xl p-5">
            <span className="font-display text-sm font-bold tabular-nums text-primary">{s.n}</span>
            <h3 className="font-display text-base font-semibold tracking-tight">{s.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ol>
      <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-accent" aria-hidden="true" />
        Runs on Robinhood Chain Testnet. Your keys never leave your wallet.
        <Coins className="size-3.5 text-primary" aria-hidden="true" />
      </p>
    </section>
  )
}

function SectionHeading({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h2 id={id} className="font-display text-2xl font-bold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
    </div>
  )
}
