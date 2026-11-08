import { Billboard } from '@react-three/drei'
import { type ThreeEvent, useFrame } from '@react-three/fiber'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { formatShortDate, formatTimeLeft } from '@/shared/lib/format-time'
import {
  hashToUnit,
  ORBIT_MARKS,
  planetPalette,
  radiusForHours,
  SOLAR,
  type SolarBody,
  starDirection,
} from '../../lib/solar'
import type { GoalListItem } from '../../types'
import { ScreenLabel } from './screen-label'
import { glowTexture, planetTexture, starTexture } from './textures'

// Atmosfera: brilha só na borda da esfera (efeito Fresnel)
const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`
const atmosphereFragment = /* glsl */ `
  uniform vec3 color;
  uniform float intensity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.6);
    gl_FragColor = vec4(color, rim * intensity);
  }
`

function useAtmosphere(color: string, intensity = 1.25) {
  return useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(color) },
          intensity: { value: intensity },
        },
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [color, intensity],
  )
}

function circlePoints(radius: number, segments = 128) {
  return Array.from({ length: segments }, (_, i) => {
    const angle = (i / segments) * Math.PI * 2
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius,
    )
  })
}

function OrbitLine({
  radius,
  color,
  opacity,
  materialRef,
}: {
  radius: number
  color: string
  opacity: number
  /** Para animar a opacidade no loop, sem renderizar de novo */
  materialRef?: React.RefObject<THREE.LineBasicMaterial | null>
}) {
  const geometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(circlePoints(radius)),
    [radius],
  )
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </lineLoop>
  )
}

export function OrbitGuides({ traveling }: { traveling: boolean }) {
  return (
    <group>
      {ORBIT_MARKS.map((mark) => {
        const radius = radiusForHours(mark.hours)
        return (
          <group key={mark.hours}>
            <OrbitLine radius={radius} color="#9fb0ff" opacity={0.07} />
            <group position={[0, 0, -radius]}>
              <ScreenLabel
                lines={[
                  {
                    text: mark.label,
                    color: 'rgba(255, 255, 255, 0.38)',
                    variant: 'small',
                  },
                ]}
                anchor={[0.5, 0.5]}
              />
            </group>
          </group>
        )
      })}
      <OrbitLine
        radius={SOLAR.horizonRadius}
        color="#ff8a65"
        opacity={traveling ? 0.5 : 0.3}
      />
    </group>
  )
}

// Sol: centro quase branco, borda alaranjada (limb darkening) e uma
// superfície que "ferve" devagar
const sunFragment = /* glsl */ `
  uniform float time;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPosition;

  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
  }
  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = mix(
      mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x),
          mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
          mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
    return n;
  }

  void main() {
    float facing = max(dot(vNormal, vView), 0.0);
    float edge = pow(1.0 - facing, 1.4);
    float granules = noise(vPosition * 1.6 + time * 0.25) * 0.6
      + noise(vPosition * 4.0 - time * 0.4) * 0.4;
    vec3 core = vec3(1.0, 0.97, 0.88);
    vec3 rim = vec3(1.0, 0.55, 0.18);
    vec3 color = mix(core, rim, edge);
    color *= 0.88 + granules * 0.24;
    gl_FragColor = vec4(color, 1.0);
  }
`
const sunVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPosition;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    vPosition = position;
    gl_Position = projectionMatrix * mv;
  }
`

export function Sun({ label, animate }: { label: string; animate: boolean }) {
  const inner = useRef<THREE.Sprite>(null)
  const outer = useRef<THREE.Sprite>(null)
  const glow = glowTexture()
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: sunVertex,
        fragmentShader: sunFragment,
      }),
    [],
  )

  // A coroa respira devagar
  useFrame(({ clock }) => {
    if (!animate) return
    const t = clock.elapsedTime
    material.uniforms.time.value = t
    inner.current?.scale.setScalar(16 + Math.sin(t * 0.9) * 0.6)
    outer.current?.scale.setScalar(26 + Math.sin(t * 0.5 + 1) * 1.2)
  })

  return (
    <group>
      <pointLight color="#fff1dc" intensity={3.2} decay={0} />
      <mesh material={material}>
        <sphereGeometry args={[SOLAR.sunRadius, 40, 40]} />
      </mesh>
      <sprite ref={inner} scale={16}>
        <spriteMaterial
          map={glow}
          color="#ffcf87"
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <sprite ref={outer} scale={26}>
        <spriteMaterial
          map={glow}
          color="#ff9a4d"
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <ScreenLabel
        lines={[{ text: label, color: '#fde8c4', variant: 'mono' }]}
        offset={SOLAR.sunRadius + 0.9}
      />
    </group>
  )
}

export function sunLabel(now: number, viewNow: number) {
  return viewNow === now ? 'agora' : formatShortDate(viewNow)
}

function PlanetRing({
  size,
  progress,
  color,
  tilt,
}: {
  size: number
  progress: number
  color: string
  tilt: number
}) {
  const inner = size * 1.5
  const outer = size * 1.78
  return (
    <group rotation={[-Math.PI / 2 + 0.32, 0, tilt]}>
      <mesh>
        <ringGeometry args={[inner, outer, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {progress > 0 && (
        <mesh>
          <ringGeometry
            args={[
              inner + (outer - inner) * 0.25,
              outer - (outer - inner) * 0.25,
              64,
              1,
              Math.PI / 2,
              Math.max(0.01, progress * Math.PI * 2),
            ]}
          />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}

interface PlanetProps {
  body: SolarBody
  now: number
  selected: boolean
  /** Rótulo visível mesmo sem hover (as metas mais próximas do prazo) */
  labelAlways: boolean
  /** Meta sob o mouse; lida no loop, sem renderizar de novo */
  hoveredRef: React.RefObject<string | null>
  /** Relógio da cena, em segundos (só anda enquanto a cena desenha) */
  time: React.RefObject<number>
  interactive: boolean
  animate: boolean
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
}

// memo: selecionar uma meta só renderiza de novo ela e a anterior
export const Planet = memo(function Planet({
  body,
  now,
  selected,
  labelAlways,
  hoveredRef,
  time,
  interactive,
  animate,
  onHover,
  onSelect,
}: PlanetProps) {
  const group = useRef<THREE.Group>(null)
  const surface = useRef<THREE.Mesh>(null)
  const orbitMaterial = useRef<THREE.LineBasicMaterial>(null)
  // Nasce perto do sol e se afasta até a própria órbita
  const radius = useRef(animate ? SOLAR.sunRadius + 1 : body.radius)
  const scale = useRef(1)

  const { goal, size, kind, urgent } = body
  const palette = planetPalette(goal, urgent)
  const texture = useMemo(
    () => (kind === 'planet' ? planetTexture(goal.id, palette) : null),
    [kind, goal.id, palette],
  )
  const atmosphere = useAtmosphere(palette.light, kind === 'fallen' ? 1.6 : 1.2)
  const { total, completed } = goal.progress
  const axialTilt = (hashToUnit(`${goal.id}-tilt`) - 0.5) * 0.7
  const labelOffset = size * (total > 0 ? 1.9 : 1.5) + 0.5

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    radius.current += (body.radius - radius.current) * (1 - Math.exp(-dt * 1.8))
    const seconds = animate ? time.current : 0
    const angle = body.phase + body.speed * seconds
    group.current?.position.set(
      Math.cos(angle) * radius.current,
      0,
      Math.sin(angle) * radius.current,
    )
    const highlighted = selected || hoveredRef.current === goal.id
    const target = highlighted ? 1.18 : 1
    scale.current += (target - scale.current) * (1 - Math.exp(-dt * 8))
    group.current?.scale.setScalar(scale.current)
    if (surface.current && animate) surface.current.rotation.y += dt * 0.12
    if (orbitMaterial.current) {
      const opacity = highlighted ? 0.4 : 0.1
      orbitMaterial.current.opacity +=
        (opacity - orbitMaterial.current.opacity) * Math.min(1, dt * 10)
    }
  })

  const isLabelVisible = useCallback(
    () => labelAlways || selected || hoveredRef.current === goal.id,
    [labelAlways, selected, hoveredRef, goal.id],
  )

  const handlers = interactive
    ? {
        onClick: (event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation()
          onSelect(goal.id)
        },
        onPointerOver: (event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation()
          onHover(goal.id)
        },
        onPointerOut: () => onHover(null),
      }
    : {}

  const timeLeft = formatTimeLeft(goal.deadline, now)

  return (
    <>
      {kind === 'planet' && (
        <OrbitLine
          radius={body.radius}
          color={palette.light}
          opacity={0.1}
          materialRef={orbitMaterial}
        />
      )}
      <group ref={group}>
        <group rotation={[0, 0, axialTilt]}>
          <mesh ref={surface} {...handlers}>
            <sphereGeometry args={[size, 40, 24]} />
            {texture ? (
              <meshStandardMaterial
                map={texture}
                roughness={0.9}
                metalness={0}
              />
            ) : (
              <meshStandardMaterial
                color={palette.dark}
                emissive={palette.dark}
                emissiveIntensity={0.6}
                roughness={0.8}
              />
            )}
          </mesh>
          <mesh scale={1.14} material={atmosphere}>
            <sphereGeometry args={[size, 24, 16]} />
          </mesh>
          {kind === 'planet' && total > 0 && (
            <PlanetRing
              size={size}
              progress={completed / total}
              color={palette.light}
              tilt={hashToUnit(`${goal.id}-ring`) * 0.5 - 0.25}
            />
          )}
        </group>

        <Billboard visible={selected}>
          <mesh>
            <ringGeometry args={[size * 2.2, size * 2.28, 64]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.7}
              depthWrite={false}
            />
          </mesh>
        </Billboard>

        {/* Sempre abaixo do planeta na tela, de qualquer ângulo */}
        <ScreenLabel
          isVisible={isLabelVisible}
          offset={labelOffset}
          lines={[
            {
              text:
                goal.title.length > 28
                  ? `${goal.title.slice(0, 27).trimEnd()}…`
                  : goal.title,
              color: '#ffffff',
              variant: 'title',
            },
            {
              text: `${kind === 'fallen' ? 'venceu ' : ''}${timeLeft}${total > 0 ? ` · ${completed}/${total}` : ''}`,
              color: urgent ? '#ffad8a' : 'rgba(255, 255, 255, 0.62)',
              variant: 'mono',
            },
          ]}
        />
      </group>
    </>
  )
})

export function AchievedStars({
  goals,
  selectedId,
  interactive,
  animate,
  onHover,
  onSelect,
}: {
  goals: GoalListItem[]
  selectedId?: string
  interactive: boolean
  animate: boolean
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
}) {
  const sprites = useRef<(THREE.Sprite | null)[]>([])
  const texture = starTexture()

  // Cintilam em ritmos diferentes
  useFrame(({ clock }) => {
    if (!animate) return
    const t = clock.elapsedTime
    sprites.current.forEach((sprite, index) => {
      if (!sprite) return
      const base = goals[index]?.id === selectedId ? 4.2 : 3
      const phase = hashToUnit(goals[index]?.id ?? '') * 10
      sprite.scale.setScalar(base * (0.85 + 0.15 * Math.sin(t * 1.6 + phase)))
    })
  })

  return (
    <group>
      {goals.map((goal, index) => {
        const [x, y, z] = starDirection(goal.id)
        const distance = SOLAR.skyRadius * 0.48
        return (
          <sprite
            key={goal.id}
            ref={(sprite) => {
              sprites.current[index] = sprite
            }}
            position={[x * distance, y * distance, z * distance]}
            scale={3}
            {...(interactive && {
              onClick: (event: ThreeEvent<MouseEvent>) => {
                event.stopPropagation()
                onSelect(goal.id)
              },
              onPointerOver: (event: ThreeEvent<PointerEvent>) => {
                event.stopPropagation()
                onHover(goal.id)
              },
              onPointerOut: () => onHover(null),
            })}
          >
            <spriteMaterial
              map={texture}
              color="#ffcf6e"
              transparent
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </sprite>
        )
      })}
    </group>
  )
}
