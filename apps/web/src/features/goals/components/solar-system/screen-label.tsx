import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

export interface LabelLine {
  text: string
  color: string
  /** 'title' = texto em destaque; 'mono' = detalhe em fonte mono */
  variant: 'title' | 'mono' | 'small'
}

const FONTS = {
  title: '600 13px "Schibsted Grotesk Variable", system-ui, sans-serif',
  mono: '500 10.5px "Geist Mono Variable", ui-monospace, monospace',
  small: '500 10px "Geist Mono Variable", ui-monospace, monospace',
}
const LINE_HEIGHT = { title: 17, mono: 14, small: 13 }
const PIXEL_RATIO = 2
const PADDING = 6

// As fontes da página podem carregar depois do primeiro desenho
const fontsReady =
  typeof document === 'undefined'
    ? Promise.resolve()
    : Promise.all([
        document.fonts.load(FONTS.title),
        document.fonts.load(FONTS.mono),
      ]).then(() => undefined)

function drawLabel(lines: LabelLine[]) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  const widths = lines.map((line) => {
    ctx.font = FONTS[line.variant]
    return ctx.measureText(line.text).width
  })
  const width = Math.ceil(Math.max(1, ...widths) + PADDING * 2)
  const height = Math.ceil(
    lines.reduce((sum, line) => sum + LINE_HEIGHT[line.variant], 0) +
      PADDING * 2,
  )

  canvas.width = width * PIXEL_RATIO
  canvas.height = height * PIXEL_RATIO
  ctx.scale(PIXEL_RATIO, PIXEL_RATIO)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  // Sombra para ler sobre qualquer planeta ou estrela
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)'
  ctx.shadowBlur = 6

  let y = PADDING
  for (const line of lines) {
    ctx.font = FONTS[line.variant]
    ctx.fillStyle = line.color
    ctx.fillText(line.text, width / 2, y)
    y += LINE_HEIGHT[line.variant]
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  return { texture, width, height }
}

/**
 * Texto dentro da cena 3D, com tamanho fixo na tela. Substitui o Html do
 * drei: nada de elementos do DOM reposicionados a cada quadro.
 */
export function ScreenLabel({
  lines,
  offset = 0,
  visible = true,
  isVisible,
  anchor = [0.5, 1],
}: {
  lines: LabelLine[]
  /** Distância (no mundo) abaixo do ponto, sempre na direção "baixo" da tela */
  offset?: number
  visible?: boolean
  /** Lido a cada quadro (ex.: hover guardado numa ref); tem prioridade sobre `visible` */
  isVisible?: () => boolean
  /** Ponto do texto preso à posição: [0.5, 1] = centro do topo */
  anchor?: [number, number]
}) {
  const group = useRef<THREE.Group>(null)
  const sprite = useRef<THREE.Sprite>(null)
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const down = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    let alive = true
    fontsReady.then(() => alive && setFontsLoaded(true))
    return () => {
      alive = false
    }
  }, [])

  const key = lines.map((line) => `${line.variant}|${line.color}|${line.text}`)
  const label = useMemo(
    () => drawLabel(lines),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key.join('\n'), fontsLoaded],
  )
  useEffect(() => () => label.texture.dispose(), [label])

  useFrame(({ camera, size }, delta) => {
    const current = sprite.current
    if (!current || !group.current) return
    // Compensa a escala do pai (planeta crescendo no hover)
    const parentScale = group.current.parent?.scale.x ?? 1
    const fov = (camera as THREE.PerspectiveCamera).fov
    const k =
      Math.tan(THREE.MathUtils.degToRad(fov / 2)) /
      (size.height / 2) /
      parentScale
    current.scale.set(label.width * k, label.height * k, 1)

    const material = current.material
    const target = (isVisible ? isVisible() : visible) ? 1 : 0
    material.opacity += (target - material.opacity) * Math.min(1, delta * 10)
    current.visible = material.opacity > 0.01

    if (offset) {
      down.set(0, -1, 0).applyQuaternion(camera.quaternion)
      group.current.position.copy(down).multiplyScalar(offset / parentScale)
    }
  })

  return (
    <group ref={group}>
      <sprite ref={sprite} center={anchor} renderOrder={10}>
        <spriteMaterial
          map={label.texture}
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
          sizeAttenuation={false}
        />
      </sprite>
    </group>
  )
}
