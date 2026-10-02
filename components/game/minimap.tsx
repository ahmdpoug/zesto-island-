'use client'

import { Maximize2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { usePlayerTracker, yawToCss } from '@/hooks/use-player-tracker'
import { MAP_H, MAP_W, MAP_EXTENT, getMapImage } from '@/lib/zesto/map-image'
import { REGION_BY_ID } from '@/lib/zesto/world'
import { PlayerArrow } from './world-map'

/** World units visible across the minimap diameter. */
const VIEW = 22

export function Minimap({ onOpen }: { onOpen: () => void }) {
  const [src] = useState(getMapImage)
  const layer = useRef<HTMLDivElement>(null)
  const arrow = useRef<HTMLDivElement>(null)

  const region = usePlayerTracker((x, z, yaw) => {
    if (layer.current) {
      const px = ((x - MAP_EXTENT.minX) / VIEW) * 100
      const pz = ((z - MAP_EXTENT.minZ) / VIEW) * 100
      layer.current.style.left = `${50 - px}%`
      layer.current.style.top = `${50 - pz}%`
    }
    if (arrow.current) arrow.current.style.transform = yawToCss(yaw)
  })
  const info = REGION_BY_ID[region]

  return (
    <div className="flex flex-col items-center gap-1.5 sm:items-end">
      <button
        type="button"
        onClick={onOpen}
        className="group relative size-24 overflow-hidden rounded-full border-2 border-[#fff6ea]/80 bg-[#126f9e] shadow-[0_10px_30px_-10px_rgb(0_0_0/0.6)] transition hover:scale-[1.03] active:scale-95 sm:size-32"
        aria-label={`Open world map. You are in ${info.name}. Shortcut: M`}
      >
        <div className="absolute inset-0">
          <div
            ref={layer}
            className="absolute"
            style={{ width: `${(MAP_W / VIEW) * 100}%`, height: `${(MAP_H / VIEW) * 100}%` }}
          >
            {src ? <img src={src} alt="" className="size-full [image-rendering:auto]" draggable={false} /> : null}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_18px_rgb(0_0_0/0.45)]" />
        <div ref={arrow} className="absolute left-1/2 top-1/2 -ml-2.5 -mt-2.5 size-5">
          <PlayerArrow />
        </div>
        <span className="absolute left-1/2 top-1 -translate-x-1/2 font-display text-[9px] font-bold text-white drop-shadow">N</span>
        <span className="absolute bottom-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-black/45 text-white opacity-80 transition group-hover:opacity-100">
          <Maximize2 className="size-3" aria-hidden="true" />
        </span>
      </button>
      <p className="glass-light flex max-w-32 items-center gap-1.5 truncate whitespace-nowrap rounded-full px-2.5 py-1 font-display text-[11px] font-semibold" aria-live="polite">
        <span className="size-2 rounded-full" style={{ background: info.color }} aria-hidden="true" />
        {info.name}
      </p>
    </div>
  )
}
