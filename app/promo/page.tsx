import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Zesto Dig — Official Trailer',
  description: 'Watch and download the 12-second Zesto Dig introduction trailer.',
}

export default function PromoPage() {
  return (
    <main className="min-h-dvh bg-background px-4 py-10 text-foreground">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <Link href="/" className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to game
        </Link>

        <header className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Official trailer</p>
          <h1 className="font-display text-3xl font-bold text-balance md:text-5xl">Meet Zesto. Dig the shore. Find the treasure.</h1>
        </header>

        <video
          src="/promo/zesto-trailer.mp4"
          poster="/promo/keyframe.png"
          controls
          playsInline
          preload="metadata"
          className="aspect-video w-full rounded-2xl border border-border bg-black shadow-2xl shadow-primary/10"
        >
          <track kind="captions" />
        </video>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">12 seconds · 1280×720 · MP4 with soundtrack</p>
          <a
            href="/promo/zesto-trailer.mp4"
            download="zesto-trailer.mp4"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Download className="size-4" aria-hidden="true" />
            Download video
          </a>
        </div>
      </div>
    </main>
  )
}
