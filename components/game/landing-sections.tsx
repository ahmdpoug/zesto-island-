import { Anvil, Coins, Hammer, Map, ShieldCheck, Shovel, TreePalm, Trophy } from 'lucide-react'
import { DIG_COST, POINTS_POOL_PERCENT, POINTS_POOL_TOKENS } from '@/lib/zesto/config'

const FEATURES = [
  { icon: Shovel, title: 'Dig for treasure', body: `Spend ${DIG_COST} $ZESTO per dig to unearth common to legendary finds, settled on-chain.` },
  { icon: TreePalm, title: 'Gather materials', body: 'Harvest wood, stone and ore across the island using free, regenerating energy.' },
  { icon: Hammer, title: 'Build a homestead', body: 'Raise a Forge, Mill, Quarry, Beacon and Vault that produce while you are away.' },
  { icon: Anvil, title: 'Craft better tools', body: 'Smelt ingots and forge tools that boost the yield of every action you take.' },
  { icon: Map, title: 'Explore a big world', body: 'Travel between regions with a live minimap and a full world map with fast travel.' },
  { icon: Trophy, title: 'Climb the leaderboard', body: 'Complete daily and weekly quests, keep your streak and rank against every player.' },
]

const STEPS = [
  { n: '01', title: 'Connect', body: 'Log in with your wallet or email in seconds.' },
  { n: '02', title: 'Verify', body: 'Sign a free message. No gas, no funds moved.' },
  { n: '03', title: 'Play & earn', body: 'Every dig, harvest and build earns points.' },
]

function compact(n: number) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

export function StatsStrip() {
  const stats = [
    { label: 'Points pool', value: `${POINTS_POOL_PERCENT}%`, hint: 'of total supply' },
    { label: 'Tokens to players', value: compact(POINTS_POOL_TOKENS), hint: '$ZESTO at TGE' },
    { label: 'Cost per dig', value: String(DIG_COST), hint: '$ZESTO on testnet' },
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
