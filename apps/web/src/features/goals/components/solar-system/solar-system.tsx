import { OrbitControls, PerformanceMonitor, Stars } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  type ComponentRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import * as THREE from 'three'
import { cn } from '@/shared/lib/utils'
import { layoutSolar, SOLAR } from '../../lib/solar'
import type { GoalListItem } from '../../types'
import { AchievedStars, OrbitGuides, Planet, Sun, sunLabel } from './bodies'

type OrbitControlsImpl = ComponentRef<typeof OrbitControls>

export type CameraView = 'perspective' | 'top'

export interface CameraPreset {
  view: CameraView
  /** Muda a cada clique, para o mesmo botão poder "voltar" a câmera */
  nonce: number
}

const FOV = 45
// Ângulo entre a câmera e o eixo vertical na vista em perspectiva
const PERSPECTIVE_POLAR = THREE.MathUtils.degToRad(58)
const TOP_POLAR = 0.0001

// Distância para o sistema inteiro caber na tela. Na perspectiva o plano
// aparece achatado na vertical, então precisa de menos altura.
function fitDistance(aspect: number, view: CameraView) {
  const halfFov = THREE.MathUtils.degToRad(FOV / 2)
  const extent = SOLAR.outerRadius + 5
  const horizontal = extent / (Math.tan(halfFov) * aspect)
  const vertical = (extent / Math.tan(halfFov)) * (view === 'top' ? 1.12 : 0.82)
  return Math.min(160, Math.max(horizontal, vertical))
}

function presetSpherical(view: CameraView, aspect: number) {
  return new THREE.Spherical(
    fitDistance(aspect, view),
    view === 'top' ? TOP_POLAR : PERSPECTIVE_POLAR,
    0,
  )
}

function CameraRig({
  preset,
  offsetX,
  controls,
}: {
  preset: CameraPreset
  offsetX: number
  controls: React.RefObject<OrbitControlsImpl | null>
}) {
  const { camera, size } = useThree()
  const target = useRef<THREE.Spherical | null>(null)
  const aspect = size.width / Math.max(size.height, 1)

  // Desloca o centro da imagem (para não ficar atrás do painel lateral)
  useEffect(() => {
    const perspective = camera as THREE.PerspectiveCamera
    if (offsetX) {
      perspective.setViewOffset(
        size.width,
        size.height,
        offsetX,
        0,
        size.width,
        size.height,
      )
    } else {
      perspective.clearViewOffset()
    }
    perspective.updateProjectionMatrix()
  }, [camera, size.width, size.height, offsetX])

  // Troca de vista: anima até a posição pedida
  useEffect(() => {
    target.current = presetSpherical(preset.view, aspect)
  }, [preset.view, preset.nonce, aspect])

  // Se o usuário pegar a câmera, a animação para
  useEffect(() => {
    const current = controls.current
    if (!current) return
    const stop = () => {
      target.current = null
    }
    current.addEventListener('start', stop)
    return () => current.removeEventListener('start', stop)
  }, [controls])

  const spherical = useMemo(() => new THREE.Spherical(), [])

  useFrame((_, delta) => {
    const goal = target.current
    if (!goal) return
    const k = 1 - Math.exp(-Math.min(delta, 0.1) * 3.2)
    spherical.setFromVector3(camera.position)
    // Caminho mais curto no azimute
    let dTheta = goal.theta - spherical.theta
    dTheta = Math.atan2(Math.sin(dTheta), Math.cos(dTheta))
    spherical.radius += (goal.radius - spherical.radius) * k
    spherical.phi += (goal.phi - spherical.phi) * k
    spherical.theta += dTheta * k
    spherical.makeSafe()
    camera.position.setFromSpherical(spherical)
    camera.lookAt(0, 0, 0)
    controls.current?.update()

    if (
      Math.abs(goal.radius - spherical.radius) < 0.05 &&
      Math.abs(goal.phi - spherical.phi) < 0.002 &&
      Math.abs(dTheta) < 0.002
    ) {
      target.current = null
    }
  })

  return null
}

// Céu desenhado na própria cena: o canvas fica opaco (mais barato de compor
// com a página do que um canvas transparente sobre gradientes em CSS)
const skyVertex = /* glsl */ `
  varying vec3 vDirection;
  void main() {
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const skyFragment = /* glsl */ `
  varying vec3 vDirection;
  vec3 blob(vec3 dir, vec3 center, vec3 color, float size) {
    return color * pow(max(dot(dir, normalize(center)), 0.0), size);
  }
  void main() {
    vec3 dir = normalize(vDirection);
    vec3 color = mix(vec3(0.012, 0.016, 0.04), vec3(0.05, 0.06, 0.14), 1.0 - abs(dir.y));
    color += blob(dir, vec3(-0.6, 0.35, -0.7), vec3(0.2, 0.15, 0.55), 6.0) * 0.55;
    color += blob(dir, vec3(0.7, -0.2, 0.6), vec3(0.03, 0.32, 0.4), 7.0) * 0.4;
    color += blob(dir, vec3(0.2, 0.1, -0.9), vec3(0.45, 0.12, 0.35), 10.0) * 0.25;
    gl_FragColor = vec4(color, 1.0);
  }
`

function SkyDome() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  )
  return (
    <mesh material={material} renderOrder={-1}>
      <sphereGeometry args={[400, 32, 16]} />
    </mesh>
  )
}

// O céu gira bem devagar
function Sky({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (animate && group.current) group.current.rotation.y += delta * 0.004
  })
  return (
    <group ref={group}>
      <Stars
        radius={130}
        depth={70}
        count={2000}
        factor={3.4}
        saturation={0.15}
        fade
        speed={animate ? 0.5 : 0}
      />
    </group>
  )
}

export interface SolarSystemProps {
  goals: GoalListItem[]
  /** Hora real, usada nas contagens regressivas */
  now: number
  /** Instante mostrado; difere de `now` na viagem no tempo */
  viewNow?: number
  selectedId?: string
  interactive?: boolean
  preset?: CameraPreset
  /** Desloca o centro da cena para a esquerda, em pixels */
  offsetX?: number
  /**
   * Congela a cena (ex.: painel ou modal aberto por cima): a GPU fica livre
   * para a animação do painel
   */
  paused?: boolean
  onSelect?: (id: string) => void
  className?: string
}

// Relógio da cena: parte da hora real (posições iguais entre recarregamentos),
// mas só anda quando a cena está desenhando. Pausar e voltar não dá "pulo".
function SceneClock({
  time,
  animate,
}: {
  time: React.RefObject<number>
  animate: boolean
}) {
  useFrame((_, delta) => {
    if (animate) time.current += Math.min(delta, 0.1)
  })
  return null
}

const DEFAULT_PRESET: CameraPreset = { view: 'perspective', nonce: 0 }

// memo: abrir painéis, a dock ou a viagem no tempo não renderiza a cena de novo
export const SolarSystem = memo(function SolarSystem({
  goals,
  now,
  viewNow = now,
  selectedId,
  interactive = true,
  preset = DEFAULT_PRESET,
  offsetX = 0,
  paused = false,
  onSelect,
  className,
}: SolarSystemProps) {
  const controls = useRef<OrbitControlsImpl>(null)
  const time = useRef(Date.now() / 1000)
  // O hover fica numa ref lida no loop de animação: passar o mouse pelos
  // planetas não dispara nenhuma renderização do React
  const hoveredRef = useRef<string | null>(null)
  const setHovered = useCallback((id: string | null) => {
    hoveredRef.current = id
    document.body.style.cursor = id ? 'pointer' : ''
  }, [])
  // Callback estável, para os planetas memorizados não renderizarem de novo
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const select = useCallback((id: string) => onSelectRef.current?.(id), [])
  // Resolução adaptativa: cai para 1x se o FPS baixar
  const maxDpr = Math.min(window.devicePixelRatio || 1, 1.5)
  const [dpr, setDpr] = useState(maxDpr)
  const [animate] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const { bodies, achieved } = useMemo(
    () => layoutSolar(goals, viewNow),
    [goals, viewNow],
  )

  useEffect(
    () => () => {
      document.body.style.cursor = ''
    },
    [],
  )

  const initial = presetSpherical(
    preset.view,
    window.innerWidth / window.innerHeight,
  )
  const initialPosition = new THREE.Vector3().setFromSpherical(initial)

  return (
    <div
      className={cn('absolute inset-0', className)}
      // O botão direito gira a câmera; sem o menu do navegador por cima
      onContextMenu={(event) => event.preventDefault()}
    >
      <Canvas
        frameloop={paused ? 'demand' : 'always'}
        dpr={dpr}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        camera={{
          fov: FOV,
          near: 0.1,
          far: 600,
          position: initialPosition.toArray(),
        }}
        onPointerMissed={() => setHovered(null)}
      >
        <PerformanceMonitor
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(maxDpr)}
          flipflops={3}
          onFallback={() => setDpr(1)}
        />
        <SceneClock time={time} animate={animate} />
        <SkyDome />
        <ambientLight color="#8fa2ff" intensity={0.22} />
        <Sky animate={animate} />
        <OrbitGuides traveling={viewNow !== now} />
        <Sun label={sunLabel(now, viewNow)} animate={animate} />

        {bodies.map((body) => (
          <Planet
            key={body.goal.id}
            body={body}
            now={now}
            selected={body.goal.id === selectedId}
            labelAlways={body.kind === 'planet' && body.rank < 6}
            hoveredRef={hoveredRef}
            time={time}
            interactive={interactive}
            animate={animate}
            onHover={setHovered}
            onSelect={select}
          />
        ))}

        <AchievedStars
          goals={achieved}
          selectedId={selectedId}
          interactive={interactive}
          animate={animate}
          onHover={setHovered}
          onSelect={select}
        />

        {interactive && (
          <OrbitControls
            ref={controls}
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.55}
            zoomSpeed={0.7}
            minDistance={16}
            maxDistance={170}
            maxPolarAngle={THREE.MathUtils.degToRad(84)}
            mouseButtons={{
              LEFT: undefined,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.ROTATE,
            }}
            touches={{
              ONE: THREE.TOUCH.ROTATE,
              TWO: THREE.TOUCH.DOLLY_ROTATE,
            }}
          />
        )}
        <CameraRig preset={preset} offsetX={offsetX} controls={controls} />
      </Canvas>
    </div>
  )
})

export default SolarSystem
