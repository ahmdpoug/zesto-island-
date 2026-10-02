'use client'

import { useEffect, useRef, useState } from 'react'
import { playerState, regionAt, type RegionId } from '@/lib/zesto/world'

/** Runs a rAF loop that hands the live player position to `onFrame` without re-rendering, and reports region changes. */
export function usePlayerTracker(onFrame: (x: number, z: number, yaw: number) => void) {
  const frame = useRef(onFrame)
  frame.current = onFrame
  const [region, setRegion] = useState<RegionId>(() => regionAt(playerState.x, playerState.z))

  useEffect(() => {
    let id = 0
    let last: RegionId | null = null
    const tick = () => {
      frame.current(playerState.x, playerState.z, playerState.yaw)
      const next = regionAt(playerState.x, playerState.z)
      if (next !== last) {
        last = next
        setRegion(next)
      }
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [])

  return region
}

/** Map arrows point up by default; yaw 0 faces +z (down on the map). */
export const yawToCss = (yaw: number) => `rotate(${Math.PI - yaw}rad)`
