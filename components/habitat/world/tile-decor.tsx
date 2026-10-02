'use client'

import { memo } from 'react'
import type { SeasonId, TileId } from '@/lib/habitat/data'

const FOLIAGE: Record<SeasonId, string[]> = {
  spring: ['#4fae47', '#6cc253', '#ff9fc4'],
  summer: ['#3f9a3a', '#4fae47', '#5cb84a'],
  autumn: ['#e07b2a', '#e8a33a', '#c9542c'],
  winter: ['#eef4fa', '#dfe9f3', '#cfdcea'],
}

const FLOWERS: Record<SeasonId, string[]> = {
  spring: ['#ff8fb8', '#fff3a8', '#ffffff'],
  summer: ['#ffc23d', '#ff6f6f', '#ffffff'],
  autumn: ['#e8792e', '#ffcf6b', '#b9542c'],
  winter: ['#ffffff', '#cfe6ff', '#ffffff'],
}

function rand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function spots(index: number, count: number, spread = 0.55) {
  return Array.from({ length: count }, (_, i) => {
    const a = rand(index * 13 + i) * Math.PI * 2
    const d = 0.18 + rand(index * 7 + i * 3) * spread
    return { x: Math.cos(a) * d, z: Math.sin(a) * d, s: 0.75 + rand(index * 5 + i) * 0.5, k: i }
  })
}

function Tree({ x, z, s, color, winter }: { x: number; z: number; s: number; color: string; winter: boolean }) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.05, 0.2, 5]} />
        <meshStandardMaterial color="#7a4a2a" flatShading />
      </mesh>
      <mesh position={[0, 0.34, 0]} castShadow>
        <coneGeometry args={[0.2, 0.42, 6]} />
        <meshStandardMaterial color={winter ? '#4f7f5a' : color} flatShading />
      </mesh>
      {winter ? (
        <mesh position={[0, 0.5, 0]}>
          <coneGeometry args={[0.11, 0.16, 6]} />
          <meshStandardMaterial color="#ffffff" flatShading />
        </mesh>
      ) : null}
    </group>
  )
}

export const TileDecor = memo(function TileDecor({
  tile,
  index,
  season,
  hidden,
}: {
  tile: TileId
  index: number
  season: SeasonId
  hidden: boolean
}) {
  if (hidden) return null
  const foliage = FOLIAGE[season]
  const flowers = FLOWERS[season]
  const winter = season === 'winter'

  switch (tile) {
    case 'f':
      return (
        <group>
          {spots(index, 3, 0.4).map((p) => (
            <Tree key={p.k} x={p.x} z={p.z} s={p.s} color={foliage[p.k % foliage.length]} winter={winter} />
          ))}
        </group>
      )
    case 'm':
      return (
        <group>
          {spots(index, 7, 0.6).map((p) => (
            <mesh key={p.k} position={[p.x, 0.05, p.z]} scale={p.s}>
              <sphereGeometry args={[0.045, 5, 4]} />
              <meshStandardMaterial color={flowers[p.k % flowers.length]} flatShading />
            </mesh>
          ))}
        </group>
      )
    case 'g':
      return (
        <group>
          {spots(index, 2, 0.5).map((p) => (
            <mesh key={p.k} position={[p.x, 0.06, p.z]} scale={p.s}>
              <icosahedronGeometry args={[0.09, 0]} />
              <meshStandardMaterial color={foliage[1]} flatShading />
            </mesh>
          ))}
        </group>
      )
    case 'c': {
      const crop = season === 'autumn' ? '#f0b53a' : season === 'winter' ? '#e9e4dc' : season === 'summer' ? '#9ccf4a' : '#7fc25a'
      return (
        <group rotation={[0, (index % 3) * (Math.PI / 3), 0]}>
          {[-0.36, -0.12, 0.12, 0.36].map((z) => (
            <mesh key={z} position={[0, 0.05, z]}>
              <boxGeometry args={[1.05 - Math.abs(z) * 0.9, 0.08, 0.12]} />
              <meshStandardMaterial color={crop} flatShading />
            </mesh>
          ))}
        </group>
      )
    }
    case 'r':
      return (
        <group>
          {spots(index, 2, 0.35).map((p) => (
            <mesh key={p.k} position={[p.x, 0.08, p.z]} scale={p.s} rotation={[p.s, p.x, 0]} castShadow>
              <dodecahedronGeometry args={[0.14, 0]} />
              <meshStandardMaterial color={winter ? '#e9eef4' : '#8f8b85'} flatShading />
            </mesh>
          ))}
        </group>
      )
    case 's':
      return rand(index) > 0.7 ? (
        <mesh position={[0.25, 0.04, -0.2]} rotation={[0, rand(index * 3) * 6, 0]}>
          <coneGeometry args={[0.07, 0.08, 5]} />
          <meshStandardMaterial color="#ffb38a" flatShading />
        </mesh>
      ) : null
    case 'w':
      return rand(index) > 0.6 ? (
        <mesh position={[-0.2, 0.01, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.12, 8]} />
          <meshStandardMaterial color={winter ? '#ffffff' : '#7fc25a'} flatShading />
        </mesh>
      ) : null
  }
})
