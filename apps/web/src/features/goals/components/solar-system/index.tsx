import { lazy, Suspense, useCallback, useRef } from 'react'
import type { SolarSystemProps } from './solar-system'

export type { CameraPreset, CameraView } from './solar-system'

// three.js é pesado: só baixa quando a cena aparece na tela
const LazySolarSystem = lazy(() => import('./solar-system'))

export function SolarSystem({ onSelect, ...props }: SolarSystemProps) {
  // Quem usa costuma passar uma função nova a cada render; com um callback
  // estável a cena (memorizada) não renderiza de novo à toa
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const select = useCallback((id: string) => onSelectRef.current?.(id), [])

  return (
    <Suspense fallback={null}>
      <LazySolarSystem {...props} onSelect={select} />
    </Suspense>
  )
}
