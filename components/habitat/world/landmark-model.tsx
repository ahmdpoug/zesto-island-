'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type * as THREE from 'three'
import type { LandmarkId } from '@/lib/habitat/data'

const WOOD = '#9a6337'
const DARK_WOOD = '#6e4325'
const STONE = '#c9c4bb'
const DARK_STONE = '#8d8780'
const ROOF = '#d9573b'
const WHITE = '#fbf6ec'

function Std({ color, emissive, intensity = 0 }: { color: string; emissive?: string; intensity?: number }) {
  return <meshStandardMaterial color={color} emissive={emissive ?? '#000000'} emissiveIntensity={intensity} roughness={0.75} flatShading />
}

function Spin({ speed = 1, axis = 'z', children }: { speed?: number; axis?: 'y' | 'z'; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation[axis] += dt * speed
  })
  return <group ref={ref}>{children}</group>
}

function Bob({ children, amount = 0.05 }: { children: React.ReactNode; amount?: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * 2) * amount
  })
  return <group ref={ref}>{children}</group>
}

export function LandmarkModel({ id }: { id: LandmarkId }) {
  switch (id) {
    case 'shrine':
      return (
        <group>
          {[-0.28, 0.28].map((x) => (
            <mesh key={x} position={[x, 0.35, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.06, 0.7, 8]} />
              <Std color="#e2412f" />
            </mesh>
          ))}
          <mesh position={[0, 0.72, 0]} castShadow>
            <boxGeometry args={[0.86, 0.07, 0.12]} />
            <Std color="#2b2523" />
          </mesh>
          <mesh position={[0, 0.58, 0]}>
            <boxGeometry args={[0.66, 0.05, 0.08]} />
            <Std color="#e2412f" />
          </mesh>
        </group>
      )
    case 'lighthouse':
      return (
        <group>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, 0.17 + i * 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.2 - i * 0.03, 0.23 - i * 0.03, 0.3, 12]} />
              <Std color={i % 2 ? ROOF : WHITE} />
            </mesh>
          ))}
          <mesh position={[0, 1.05, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.16, 8]} />
            <Std color="#fff1a8" emissive="#ffd34d" intensity={1.6} />
          </mesh>
          <mesh position={[0, 1.2, 0]} castShadow>
            <coneGeometry args={[0.17, 0.18, 8]} />
            <Std color={ROOF} />
          </mesh>
        </group>
      )
    case 'windmill':
      return (
        <group>
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.28, 0.7, 8]} />
            <Std color={WHITE} />
          </mesh>
          <mesh position={[0, 0.82, 0]} castShadow>
            <coneGeometry args={[0.24, 0.28, 8]} />
            <Std color={ROOF} />
          </mesh>
          <group position={[0, 0.62, 0.24]}>
            <Spin speed={1.4}>
              {[0, 1, 2, 3].map((i) => (
                <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 0, 0]}>
                  <boxGeometry args={[0.08, 0.75, 0.02]} />
                  <Std color="#f1e2c4" />
                </mesh>
              ))}
            </Spin>
          </group>
        </group>
      )
    case 'hotspring':
      return (
        <group>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={i} position={[Math.cos(i) * 0.38, 0.06, Math.sin(i) * 0.38]} castShadow>
              <dodecahedronGeometry args={[0.12, 0]} />
              <Std color={DARK_STONE} />
            </mesh>
          ))}
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.32, 16]} />
            <Std color="#9ff0ea" emissive="#6fe3db" intensity={0.5} />
          </mesh>
          <Bob amount={0.08}>
            {[-0.12, 0.1].map((x) => (
              <mesh key={x} position={[x, 0.35, 0]}>
                <sphereGeometry args={[0.09, 8, 6]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.55} />
              </mesh>
            ))}
          </Bob>
        </group>
      )
    case 'treehouse':
      return (
        <group>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.11, 0.8, 6]} />
            <Std color={DARK_WOOD} />
          </mesh>
          <mesh position={[0, 0.62, 0]} castShadow>
            <boxGeometry args={[0.42, 0.26, 0.36]} />
            <Std color={WOOD} />
          </mesh>
          <mesh position={[0, 0.84, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.36, 0.22, 4]} />
            <Std color={ROOF} />
          </mesh>
          <mesh position={[0, 1.12, 0]} castShadow>
            <icosahedronGeometry args={[0.36, 0]} />
            <Std color="#3f8f35" />
          </mesh>
        </group>
      )
    case 'scarecrow':
      return (
        <group>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.7, 5]} />
            <Std color={DARK_WOOD} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.6, 0.04, 0.04]} />
            <Std color={DARK_WOOD} />
          </mesh>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.22, 0.26, 0.12]} />
            <Std color="#4a7bd1" />
          </mesh>
          <mesh position={[0, 0.7, 0]} castShadow>
            <sphereGeometry args={[0.11, 8, 6]} />
            <Std color="#f0d48a" />
          </mesh>
          <mesh position={[0, 0.82, 0]} castShadow>
            <coneGeometry args={[0.18, 0.16, 8]} />
            <Std color="#c98d3a" />
          </mesh>
        </group>
      )
    case 'glasshouse':
      return (
        <group>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.6, 0.4, 0.42]} />
            <meshStandardMaterial color="#c8f2ff" transparent opacity={0.55} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.48, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.32, 0.32, 0.44]} />
            <meshStandardMaterial color="#c8f2ff" transparent opacity={0.5} roughness={0.1} />
          </mesh>
          {[-0.15, 0, 0.15].map((x) => (
            <mesh key={x} position={[x, 0.12, 0]}>
              <sphereGeometry args={[0.07, 6, 5]} />
              <Std color="#55b04a" />
            </mesh>
          ))}
        </group>
      )
    case 'belltower':
      return (
        <group>
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[0.32, 0.8, 0.32]} />
            <Std color={STONE} />
          </mesh>
          <mesh position={[0, 0.92, 0]} castShadow>
            <boxGeometry args={[0.36, 0.24, 0.36]} />
            <Std color={WHITE} />
          </mesh>
          <mesh position={[0, 0.88, 0]}>
            <sphereGeometry args={[0.09, 8, 6]} />
            <Std color="#f2b632" emissive="#f2b632" intensity={0.3} />
          </mesh>
          <mesh position={[0, 1.18, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.3, 0.3, 4]} />
            <Std color="#3d6fb6" />
          </mesh>
        </group>
      )
    case 'gazebo':
      return (
        <group>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={i} position={[Math.cos((i * Math.PI) / 3) * 0.3, 0.25, Math.sin((i * Math.PI) / 3) * 0.3]}>
              <cylinderGeometry args={[0.025, 0.025, 0.5, 5]} />
              <Std color={WHITE} />
            </mesh>
          ))}
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.06, 6]} />
            <Std color={WOOD} />
          </mesh>
          <mesh position={[0, 0.62, 0]} castShadow>
            <coneGeometry args={[0.44, 0.3, 6]} />
            <Std color="#e47aa6" />
          </mesh>
        </group>
      )
    case 'maypole':
      return (
        <group>
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 1.1, 6]} />
            <Std color={WHITE} />
          </mesh>
          <Spin speed={0.8} axis="y">
            {['#ff8fb8', '#ffc23d', '#7fd3ff', '#9be27a'].map((c, i) => (
              <mesh key={c} position={[Math.cos((i * Math.PI) / 2) * 0.22, 0.6, Math.sin((i * Math.PI) / 2) * 0.22]} rotation={[0, 0, 0.5]}>
                <boxGeometry args={[0.03, 0.8, 0.03]} />
                <Std color={c} />
              </mesh>
            ))}
          </Spin>
          <mesh position={[0, 1.13, 0]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <Std color="#ffc23d" />
          </mesh>
        </group>
      )
    case 'well':
      return (
        <group>
          <mesh position={[0, 0.14, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.26, 0.28, 10]} />
            <Std color={STONE} />
          </mesh>
          <mesh position={[0, 0.29, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.18, 12]} />
            <Std color="#3fb6cc" />
          </mesh>
          {[-0.2, 0.2].map((x) => (
            <mesh key={x} position={[x, 0.45, 0]}>
              <boxGeometry args={[0.04, 0.34, 0.04]} />
              <Std color={WOOD} />
            </mesh>
          ))}
          <mesh position={[0, 0.66, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <coneGeometry args={[0.24, 0.5, 4]} />
            <Std color={ROOF} />
          </mesh>
        </group>
      )
    case 'stones':
      return (
        <group>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(a) * 0.32, 0.25, Math.sin(a) * 0.32]} rotation={[0, a, 0.05]} castShadow>
                <boxGeometry args={[0.12, 0.5 + (i % 2) * 0.12, 0.1]} />
                <Std color={DARK_STONE} />
              </mesh>
            )
          })}
          <mesh position={[0, 0.25, 0]}>
            <octahedronGeometry args={[0.1, 0]} />
            <Std color="#bfe8ff" emissive="#9fd8ff" intensity={1.2} />
          </mesh>
        </group>
      )
    case 'campfire':
      return (
        <group>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, 0.05, 0]} rotation={[0, (i * Math.PI) / 3, Math.PI / 2]}>
              <cylinderGeometry args={[0.035, 0.035, 0.42, 5]} />
              <Std color={DARK_WOOD} />
            </mesh>
          ))}
          <Bob amount={0.02}>
            <mesh position={[0, 0.2, 0]}>
              <coneGeometry args={[0.12, 0.3, 6]} />
              <Std color="#ff9b2f" emissive="#ff7a1a" intensity={1.8} />
            </mesh>
          </Bob>
          <pointLight position={[0, 0.4, 0]} color="#ff9b4a" intensity={1.2} distance={2.5} />
        </group>
      )
    case 'sundial':
      return (
        <group>
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.14, 0.24, 8]} />
            <Std color={STONE} />
          </mesh>
          <mesh position={[0, 0.26, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.04, 16]} />
            <Std color="#f0e2c0" />
          </mesh>
          <mesh position={[0, 0.36, 0]} rotation={[0, 0, -0.6]}>
            <boxGeometry args={[0.02, 0.24, 0.12]} />
            <Std color="#d39b2a" />
          </mesh>
        </group>
      )
    case 'snowman':
      return (
        <group>
          {[
            [0.22, 0.22],
            [0.16, 0.55],
            [0.11, 0.8],
          ].map(([r, y]) => (
            <mesh key={y} position={[0, y, 0]} castShadow>
              <sphereGeometry args={[r, 10, 8]} />
              <Std color="#ffffff" />
            </mesh>
          ))}
          <mesh position={[0, 0.8, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.025, 0.12, 6]} />
            <Std color="#ff8a2a" />
          </mesh>
          <mesh position={[0, 0.94, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.12, 8]} />
            <Std color="#2b2523" />
          </mesh>
        </group>
      )
    case 'beehive':
      return (
        <group>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.5, 5]} />
            <Std color={DARK_WOOD} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, 0.5 + i * 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.16 - i * 0.04, 0.18 - i * 0.04, 0.1, 10]} />
              <Std color="#f2b632" />
            </mesh>
          ))}
          <Spin speed={2} axis="y">
            <mesh position={[0.3, 0.6, 0]}>
              <sphereGeometry args={[0.035, 6, 4]} />
              <Std color="#2b2523" />
            </mesh>
          </Spin>
        </group>
      )
    case 'kite':
      return (
        <group>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 1, 3]} />
            <Std color={WHITE} />
          </mesh>
          <Bob amount={0.08}>
            <mesh position={[0, 1.05, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
              <boxGeometry args={[0.28, 0.28, 0.02]} />
              <Std color="#ff5d7a" />
            </mesh>
          </Bob>
        </group>
      )
    case 'totem':
      return (
        <group>
          {['#2a78f0', '#f6cf1c', '#ff7a1a', '#a46bff'].map((c, i) => (
            <group key={c} position={[0, 0.16 + i * 0.28, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.16, 0.18, 0.26, 8]} />
                <Std color={c} />
              </mesh>
              {[-0.06, 0.06].map((x) => (
                <mesh key={x} position={[x, 0.03, 0.15]}>
                  <sphereGeometry args={[0.035, 6, 5]} />
                  <Std color="#ffffff" />
                </mesh>
              ))}
            </group>
          ))}
          <mesh position={[0, 1.28, 0]}>
            <octahedronGeometry args={[0.1, 0]} />
            <Std color="#ffe08a" emissive="#ffd34d" intensity={1.4} />
          </mesh>
        </group>
      )
  }
}
