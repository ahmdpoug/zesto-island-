'use client'

import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { ZestoModel, type Motion } from '@/components/game/world/zesto-model'
import { SEASON_BY_ID, SPIRIT_BY_ID, TILE_BY_ID, type LandmarkId, type SeasonId, type TileId } from '@/lib/habitat/data'
import { HEXES } from '@/lib/habitat/hex'
import type { SpiritVisit } from '@/lib/habitat/types'
import type { CharacterId } from '@/lib/zesto/config'
import { LandmarkModel } from './landmark-model'
import { TileDecor } from './tile-decor'

const HEIGHT: Record<TileId, number> = { w: 0.14, s: 0.32, g: 0.42, m: 0.44, c: 0.42, f: 0.48, r: 0.78 }
const SEA_Y = 0.16
const HEX_GEOMETRY = (() => {
  const g = new THREE.CylinderGeometry(0.985, 0.985, 1, 6)
  g.translate(0, 0.5, 0)
  return g
})()
const SIDE = '#9b6a44'

type SceneProps = {
  tiles: string
  radius: number
  season: SeasonId
  landmarks: Map<number, LandmarkId>
  character: CharacterId
  spirits: SpiritVisit[]
  selected?: TileId | null
  walkTo?: number | null
  onPlace?: (index: number) => void
}

export function IslandScene(props: SceneProps) {
  const sky = SEASON_BY_ID[props.season].sky
  const distance = 7 + props.radius * 2.6
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, distance * 0.78, distance * 0.72], fov: 40, near: 0.1, far: 200 }}
      className="touch-none"
    >
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[sky, distance * 1.6, distance * 3.2]} />
      <hemisphereLight args={['#fff6e5', '#5d7f8f', 0.9]} />
      <directionalLight
        position={[6, 12, 5]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />
      <Sea season={props.season} />
      <Island {...props} />
      <Walker id={props.character} target={props.walkTo ?? null} tiles={props.tiles} />
      <Spirits spirits={props.spirits} radius={props.radius} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        minDistance={6}
        maxDistance={34}
        minPolarAngle={0.35}
        maxPolarAngle={1.15}
        target={[0, 0.3, 0]}
      />
    </Canvas>
  )
}

function Sea({ season }: { season: SeasonId }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = SEA_Y + Math.sin(clock.elapsedTime * 0.8) * 0.02
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[80, 48]} />
      <meshStandardMaterial color={SEASON_BY_ID[season].sea} roughness={0.35} metalness={0.05} />
    </mesh>
  )
}

const Island = memo(function Island({ tiles, radius, season, landmarks, selected, onPlace }: SceneProps) {
  const [hover, setHover] = useState<number | null>(null)
  const visible = useMemo(() => HEXES.filter((h) => h.ring <= radius), [radius])
  const nextRing = useMemo(() => HEXES.filter((h) => h.ring === radius + 1), [radius])

  return (
    <group>
      {visible.map((h) => {
        const tile = tiles[h.index] as TileId
        const landmark = landmarks.get(h.index)
        return (
          <HexTile
            key={h.index}
            index={h.index}
            x={h.x}
            z={h.z}
            tile={tile}
            season={season}
            landmark={landmark}
            onPick={onPlace}
            onHover={setHover}
          />
        )
      })}
      {nextRing.map((h) => (
        <mesh key={h.index} position={[h.x, SEA_Y + 0.01, h.z]} rotation={[-Math.PI / 2, 0, Math.PI / 6]}>
          <ringGeometry args={[0.86, 0.94, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.18} />
        </mesh>
      ))}
      {hover !== null && selected && onPlace ? <HoverMarker index={hover} tile={selected} tiles={tiles} /> : null}
    </group>
  )
})

function HoverMarker({ index, tile, tiles }: { index: number; tile: TileId; tiles: string }) {
  const h = HEXES[index]
  const top = HEIGHT[tiles[index] as TileId]
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = top + 0.06 + Math.sin(clock.elapsedTime * 5) * 0.02
  })
  return (
    <mesh ref={ref} position={[h.x, top + 0.06, h.z]} rotation={[-Math.PI / 2, 0, Math.PI / 6]}>
      <ringGeometry args={[0.7, 0.92, 6]} />
      <meshBasicMaterial color={TILE_BY_ID[tile].colors.summer} transparent opacity={0.9} />
    </mesh>
  )
}

const HexTile = memo(
  function HexTile({
    index,
    x,
    z,
    tile,
    season,
    landmark,
    onPick,
    onHover,
  }: {
    index: number
    x: number
    z: number
    tile: TileId
    season: SeasonId
    landmark?: LandmarkId
    onPick?: (index: number) => void
    onHover: React.Dispatch<React.SetStateAction<number | null>>
  }) {
    const interactive = !!onPick
    const column = useRef<THREE.Mesh>(null)
    const top = useRef<THREE.Group>(null)
    const pop = useRef(0)
    const target = HEIGHT[tile]
    const color = TILE_BY_ID[tile].colors[season]

    useEffect(() => {
      pop.current = 1
    }, [tile])

    useFrame((_, dt) => {
      if (!column.current || !top.current) return
      const current = column.current.scale.y
      const next = THREE.MathUtils.damp(current, target, 10, dt)
      column.current.scale.y = next
      pop.current = Math.max(0, pop.current - dt * 3)
      const bounce = Math.sin(pop.current * Math.PI) * 0.12
      top.current.position.y = next + bounce
    })

    return (
      <group position={[x, 0, z]}>
        <mesh
          ref={column}
          geometry={HEX_GEOMETRY}
          scale={[1, target, 1]}
          castShadow
          receiveShadow
          onClick={
            interactive
              ? (e: ThreeEvent<MouseEvent>) => {
                  e.stopPropagation()
                  if (e.delta <= 6) onPick?.(index)
                }
              : undefined
          }
          onPointerOver={
            interactive
              ? (e: ThreeEvent<PointerEvent>) => {
                  e.stopPropagation()
                  onHover(index)
                }
              : undefined
          }
          onPointerOut={interactive ? () => onHover((v) => (v === index ? null : v)) : undefined}
        >
          <meshStandardMaterial attach="material-0" color={SIDE} flatShading />
          <meshStandardMaterial
            attach="material-1"
            color={color}
            flatShading
            transparent={tile === 'w'}
            opacity={tile === 'w' ? 0.92 : 1}
          />
          <meshStandardMaterial attach="material-2" color={SIDE} />
        </mesh>
        <group ref={top} position={[0, target, 0]}>
          <TileDecor tile={tile} index={index} season={season} hidden={!!landmark} />
          {landmark ? <LandmarkModel id={landmark} /> : null}
        </group>
      </group>
    )
  },
  (a, b) => a.tile === b.tile && a.season === b.season && a.landmark === b.landmark && a.onPick === b.onPick,
)

function Walker({ id, target, tiles }: { id: CharacterId; target: number | null; tiles: string }) {
  const group = useRef<THREE.Group>(null)
  const motion = useRef<Motion>({ speed: 0, dig: 0 })
  const goal = useRef(new THREE.Vector3(0, HEIGHT.m, 0))

  useEffect(() => {
    if (target === null) return
    const h = HEXES[target]
    goal.current.set(h.x, HEIGHT[tiles[target] as TileId] ?? HEIGHT.g, h.z)
  }, [target, tiles])

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    const dx = goal.current.x - g.position.x
    const dz = goal.current.z - g.position.z
    const dist = Math.hypot(dx, dz)
    const step = Math.min(dist, dt * 3.2)
    if (dist > 0.05) {
      g.position.x += (dx / dist) * step
      g.position.z += (dz / dist) * step
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, Math.atan2(dx, dz), 10, dt)
    }
    g.position.y = THREE.MathUtils.damp(g.position.y, Math.max(goal.current.y, SEA_Y), 8, dt)
    motion.current.speed = dist > 0.05 ? 1 : THREE.MathUtils.damp(motion.current.speed, 0, 6, dt)
  })

  return (
    <group ref={group} position={[0, HEIGHT.m, 0]} scale={0.34}>
      <ZestoModel id={id} motion={motion} />
    </group>
  )
}

function Spirits({ spirits, radius }: { spirits: SpiritVisit[]; radius: number }) {
  return (
    <group>
      {spirits.slice(0, 6).map((s, i) => (
        <Spirit key={`${s.at}-${i}`} color={SPIRIT_BY_ID[s.id]?.color ?? '#fff3a8'} phase={i * 1.7} orbit={radius * 0.9 + 0.6} />
      ))}
    </group>
  )
}

function Spirit({ color, phase, orbit }: { color: string; phase: number; orbit: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.25 + phase
    if (ref.current) ref.current.position.set(Math.cos(t) * orbit, 1.6 + Math.sin(t * 3) * 0.25, Math.sin(t) * orbit)
  })
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.13, 12, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <pointLight color={color} intensity={0.8} distance={3} />
    </group>
  )
}
