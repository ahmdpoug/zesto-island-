'use client'

import { Compass, Hammer, LocateFixed, MapPin, Minus, Navigation, Pickaxe, Plus, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { usePlayerTracker, yawToCss } from '@/hooks/use-player-tracker'
import { BUILDINGS, RESOURCE_META, RESOURCE_NODES, type BuildingKind } from '@/lib/zesto/economy'
import { MAP_H, MAP_W, getMapImage, toMapPercent } from '@/lib/zesto/map-image'
import { REGIONS, REGION_BY_ID, playerState, teleport, type RegionId, type WorldSpot } from '@/lib/zesto/world'
import { cn } from '@/lib/utils'

const MIN_ZOOM = 1
const MAX_ZOOM = 3.5

type Layer = 'spots' | 'resources' | 'buildings'
const LAYERS: { id: Layer; label: string; icon: typeof Sparkles }[] = [
  { id: 'spots', label: 'Treasure', icon: Sparkles },
  { id: 'resources', label: 'Resources', icon: Pickaxe },
  { id: 'buildings', label: 'Buildings', icon: Hammer },
]

export function PlayerArrow() {
  return (
    <svg viewBox="0 0 20 20" className="size-full drop-shadow-[0_1px_2px_rgb(0_0_0/0.6)]" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="#ffffff" fillOpacity="0.25" />
      <path d="M10 2 L16 16 L10 12.5 L4 16 Z" fill="#ffb321" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function clampPan(v: number, zoom: number) {
  const limit = 50 - 50 / zoom
  return Math.max(-limit, Math.min(limit, v))
}

export function WorldMap({
  spots,
  buildingLevels,
  onClose,
  onTravel,
}: {
  spots: WorldSpot[]
  buildingLevels: Partial<Record<BuildingKind, number>>
  onClose: () => void
  onTravel: (regionName: string) => void
}) {
  const [src] = useState(getMapImage)
  const [zoom, setZoom] = useState(1.6)
  const [pan, setPan] = useState(() => {
    const p = toMapPercent(playerState.x, playerState.z)
    return { x: clampPan(50 - p.left, 1.6), y: clampPan(50 - p.top, 1.6) }
  })
  const [layers, setLayers] = useState<Record<Layer, boolean>>({ spots: true, resources: true, buildings: true })
  const [selected, setSelected] = useState<RegionId | null>(null)
  const stage = useRef<HTMLDivElement>(null)
  const marker = useRef<HTMLDivElement>(null)
  const arrow = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null)

  const current = usePlayerTracker((x, z, yaw) => {
    const p = toMapPercent(x, z)
    if (marker.current) {
      marker.current.style.left = `${p.left}%`
      marker.current.style.top = `${p.top}%`
    }
    if (arrow.current) arrow.current.style.transform = yawToCss(yaw)
  })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const applyZoom = (next: number) => {
    const z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, next))
    setZoom(z)
    setPan((p) => ({ x: clampPan(p.x, z), y: clampPan(p.y, z) }))
  }

  const focus = (x: number, z: number, nextZoom = zoom) => {
    const p = toMapPercent(x, z)
    setZoom(nextZoom)
    setPan({ x: clampPan(50 - p.left, nextZoom), y: clampPan(50 - p.top, nextZoom) })
  }

  const onPointerDown = (e: ReactPointerEvent) => {
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: ReactPointerEvent) => {
    const d = drag.current
    const rect = stage.current?.getBoundingClientRect()
    if (!d || d.id !== e.pointerId || !rect) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true
    d.x = e.clientX
    d.y = e.clientY
    setPan((p) => ({ x: clampPan(p.x + (dx / rect.width) * 100, zoom), y: clampPan(p.y + (dy / rect.height) * 100, zoom) }))
  }
  const endDrag = () => {
    drag.current = null
  }

  const travel = (id: RegionId) => {
    const region = REGION_BY_ID[id]
    teleport(region.waypoint)
    onTravel(region.name)
  }

  const selectRegion = (id: RegionId) => {
    if (drag.current?.moved) return
    setSelected(id)
    const r = REGION_BY_ID[id]
    focus(r.label.x, r.label.z, Math.max(zoom, 1.8))
  }

  const counterScale = { transform: `translate(-50%, -50%) scale(${1 / zoom})` }
  const currentRegion = REGION_BY_ID[current]

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col bg-[#060c19]/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="world-map-title"
    >
      <header className="flex items-center justify-between gap-3 px-4 pb-3 pt-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#ffd27a] to-[#e8862e] text-[#3a1d05] shadow-lg">
            <Compass className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="world-map-title" className="font-display text-xl font-bold leading-tight text-[#fff6ea]">
              World Map
            </h2>
            <p className="flex items-center gap-1.5 truncate text-xs text-[#fff6ea]/65">
              <MapPin className="size-3 shrink-0" aria-hidden="true" />
              {'You are in '}
              <span className="font-semibold" style={{ color: currentRegion.color }}>
                {currentRegion.name}
              </span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-[#fff6ea] transition hover:bg-white/20 active:scale-95"
        >
          <X className="size-5" aria-hidden="true" />
          <span className="sr-only">Close map</span>
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-3 pb-3 sm:px-6 sm:pb-6 lg:flex-row">
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl border border-white/10 bg-[#0f5d86] shadow-2xl">
          <div
            className="absolute inset-0 grid touch-none cursor-grab place-items-center active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onWheel={(e) => applyZoom(zoom * (e.deltaY > 0 ? 0.9 : 1.1))}
            style={{ containerType: 'size' }}
          >
            <div
              ref={stage}
              className="relative select-none transition-transform duration-200 ease-out"
              style={{
                aspectRatio: `${MAP_W} / ${MAP_H}`,
                width: `min(100cqw, calc(100cqh * ${MAP_W / MAP_H}))`,
                transform: `scale(${zoom}) translate(${pan.x}%, ${pan.y}%)`,
                transitionDuration: drag.current ? '0ms' : undefined,
              }}
            >
              {src ? <img src={src} alt="Island terrain" className="pointer-events-none size-full" draggable={false} /> : null}

              {layers.buildings
                ? BUILDINGS.map((b) => {
                    const p = toMapPercent(b.x, b.z)
                    const level = buildingLevels[b.id] ?? 0
                    return (
                      <div key={b.id} className="absolute" style={{ left: `${p.left}%`, top: `${p.top}%` }}>
                        <div style={counterScale} className="absolute">
                          <span
                            className={cn(
                              'grid size-6 place-items-center rounded-lg border-2 shadow-md',
                              level ? 'border-white bg-[#e8a25c] text-[#3a1d05]' : 'border-dashed border-white/80 bg-black/35 text-white',
                            )}
                            title={`${b.name}${level ? ` · Level ${level}` : ' · Not built'}`}
                          >
                            <Hammer className="size-3" aria-hidden="true" />
                          </span>
                        </div>
                      </div>
                    )
                  })
                : null}

              {layers.resources
                ? RESOURCE_NODES.map((n) => {
                    const p = toMapPercent(n.x, n.z)
                    return (
                      <div key={n.id} className="absolute" style={{ left: `${p.left}%`, top: `${p.top}%` }}>
                        <div style={counterScale} className="absolute">
                          <span
                            className="grid size-6 place-items-center rounded-full border-2 border-white bg-[#2c3a2a] text-sm shadow-md"
                            title={`${n.name} · ${RESOURCE_META[n.resource].label}`}
                          >
                            <Pickaxe className="size-3 text-[#c9f0a8]" aria-hidden="true" />
                          </span>
                        </div>
                      </div>
                    )
                  })
                : null}

              {layers.spots
                ? spots.map((s, i) => {
                    const p = toMapPercent(s.x, s.z)
                    return (
                      <div key={i} className="absolute" style={{ left: `${p.left}%`, top: `${p.top}%` }}>
                        <div style={counterScale} className="absolute">
                          <span className="relative grid size-4 place-items-center" title="Treasure spot">
                            <span className="absolute inset-0 animate-ping rounded-full bg-[#ffd27a]/70" />
                            <span className="relative size-2.5 rounded-full border border-white bg-[#ffb321]" />
                          </span>
                        </div>
                      </div>
                    )
                  })
                : null}

              {REGIONS.map((r) => {
                const p = toMapPercent(r.label.x, r.label.z)
                const active = selected === r.id
                return (
                  <div key={r.id} className="absolute" style={{ left: `${p.left}%`, top: `${p.top}%` }}>
                    <div style={counterScale} className="absolute">
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => selectRegion(r.id)}
                        className={cn(
                          'whitespace-nowrap rounded-full px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-wider shadow-lg ring-1 transition',
                          active ? 'scale-110 bg-[#fff6ea] text-[#2a1606] ring-white' : 'bg-[#0b1426]/75 text-[#fff6ea] ring-white/25 hover:bg-[#0b1426]/90',
                        )}
                      >
                        <span className="mr-1.5 inline-block size-1.5 rounded-full align-middle" style={{ background: r.color }} aria-hidden="true" />
                        {r.name}
                      </button>
                    </div>
                  </div>
                )
              })}

              <div ref={marker} className="absolute">
                <div style={counterScale} className="absolute">
                  <span className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-[#ffb321]/25" />
                  <div ref={arrow} className="relative size-7">
                    <PlayerArrow />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap gap-1.5">
            {LAYERS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={layers[id]}
                onClick={() => setLayers((l) => ({ ...l, [id]: !l[id] }))}
                className={cn(
                  'pointer-events-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-md backdrop-blur transition',
                  layers[id] ? 'bg-[#fff6ea] text-[#2a1606]' : 'bg-black/40 text-white/70 hover:bg-black/55',
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-2xl bg-[#0b1426]/80 text-[#fff6ea] shadow-xl ring-1 ring-white/15 backdrop-blur">
            <MapControl label="Zoom in" onClick={() => applyZoom(zoom + 0.5)}>
              <Plus className="size-4" />
            </MapControl>
            <MapControl label="Zoom out" onClick={() => applyZoom(zoom - 0.5)}>
              <Minus className="size-4" />
            </MapControl>
            <MapControl label="Center on me" onClick={() => focus(playerState.x, playerState.z, Math.max(zoom, 2))}>
              <LocateFixed className="size-4" />
            </MapControl>
          </div>
        </div>

        <aside className="shrink-0 lg:w-80" aria-label="Regions">
          <p className="mb-2 hidden px-1 font-display text-xs font-semibold uppercase tracking-widest text-[#fff6ea]/55 lg:block">
            Regions · Fast travel
          </p>
          <ul className="-mx-3 flex snap-x gap-2 overflow-x-auto px-3 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {REGIONS.map((r) => {
              const here = current === r.id
              const active = selected === r.id
              return (
                <li key={r.id} className="w-60 shrink-0 snap-start lg:w-auto">
                  <div
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border p-3 transition',
                      active ? 'border-white/40 bg-white/12' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]',
                    )}
                  >
                    <button type="button" onClick={() => selectRegion(r.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <span
                        className="size-9 shrink-0 rounded-xl shadow-inner"
                        style={{ background: `linear-gradient(135deg, ${r.color}, ${r.color}66)` }}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-display text-sm font-semibold text-[#fff6ea]">{r.name}</span>
                        <span className="block truncate text-[11px] text-[#fff6ea]/55">{r.blurb}</span>
                      </span>
                    </button>
                    {here ? (
                      <span className="shrink-0 rounded-full bg-[#5fd4c6]/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8ff0e4]">
                        Here
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => travel(r.id)}
                        className="flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-b from-[#ffd27a] to-[#f0a81a] px-3 py-1.5 font-display text-xs font-bold text-[#3a1d05] shadow-md transition hover:brightness-105 active:scale-95"
                      >
                        <Navigation className="size-3" aria-hidden="true" />
                        Go
                        <span className="sr-only">{` to ${r.name}`}</span>
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
          <p className="mt-3 hidden px-1 text-[11px] text-[#fff6ea]/45 lg:block">
            {'Drag to pan · Scroll to zoom · Press M to toggle · Esc to close'}
          </p>
        </aside>
      </div>
    </div>
  )
}

function MapControl({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="grid size-10 place-items-center transition hover:bg-white/10 active:bg-white/20">
      {children}
      <span className="sr-only">{label}</span>
    </button>
  )
}
