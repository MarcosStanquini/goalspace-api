import type { GoalListItem } from '../types'

const HOUR = 60 * 60 * 1000
const TAU = Math.PI * 2

// Além disso a meta fica na órbita mais externa
const MAX_HOURS = 24 * 180

// Unidades do mundo 3D
export const SOLAR = {
  sunRadius: 3.2,
  horizonRadius: 5.4,
  innerRadius: 8.5,
  outerRadius: 34,
  /** Período (s) de uma volta na órbita mais interna */
  innerPeriod: 140,
  skyRadius: 95,
}

export const ORBIT_MARKS = [
  { hours: 24, label: '24 h' },
  { hours: 24 * 7, label: '7 dias' },
  { hours: 24 * 30, label: '30 dias' },
  { hours: 24 * 90, label: '90 dias' },
]

export interface PlanetPalette {
  light: string
  dark: string
  kind: 'gas' | 'rocky' | 'ice'
}

const CALM_PALETTES: PlanetPalette[] = [
  { light: '#9fc0ff', dark: '#2f4fc4', kind: 'gas' },
  { light: '#d3b8ff', dark: '#5b38b8', kind: 'gas' },
  { light: '#8ee6d6', dark: '#16736f', kind: 'rocky' },
  { light: '#f2d7a6', dark: '#9c6532', kind: 'gas' },
  { light: '#d9ecff', dark: '#6f86c9', kind: 'ice' },
  { light: '#f4b6d2', dark: '#94406f', kind: 'rocky' },
  { light: '#b7f0a8', dark: '#3d7d4a', kind: 'rocky' },
]

const URGENT_PALETTES: PlanetPalette[] = [
  { light: '#ffbf94', dark: '#c2381f', kind: 'rocky' },
  { light: '#ffd27f', dark: '#c9561f', kind: 'gas' },
]

// Hash estável: a meta mantém aparência e posição entre recarregamentos
export function hashToUnit(id: string) {
  let hash = 2166136261
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  // Espalha os bits: ids parecidos não podem cair em valores próximos
  hash ^= hash >>> 16
  hash = Math.imul(hash, 0x85ebca6b)
  hash ^= hash >>> 13
  hash = Math.imul(hash, 0xc2b2ae35)
  hash ^= hash >>> 16
  return (hash >>> 0) / 2 ** 32
}

export function planetPalette(goal: GoalListItem, urgent: boolean) {
  const list = urgent ? URGENT_PALETTES : CALM_PALETTES
  return list[Math.floor(hashToUnit(`${goal.id}-palette`) * list.length)]
}

/** Cor representativa da meta, para usar fora da cena 3D */
export function planetColor(goal: GoalListItem, urgent: boolean) {
  return planetPalette(goal, urgent).light
}

// Escala logarítmica: as próximas 24 h ocupam tanto espaço quanto os meses
// seguintes, porque é onde a decisão acontece.
export function radiusForHours(hours: number) {
  const clamped = Math.min(Math.max(hours, 0), MAX_HOURS)
  const ratio = Math.log1p(clamped) / Math.log1p(MAX_HOURS)
  return SOLAR.innerRadius + ratio * (SOLAR.outerRadius - SOLAR.innerRadius)
}

// Como na 3ª lei de Kepler: quanto mais longe, mais devagar
export function orbitalSpeed(radius: number) {
  const period = SOLAR.innerPeriod * (radius / SOLAR.innerRadius) ** 1.5
  return TAU / period
}

export function planetSize(subtasks: number) {
  return 1.55 + Math.min(subtasks, 8) * 0.16
}

export interface SolarBody {
  goal: GoalListItem
  kind: 'planet' | 'fallen'
  radius: number
  /** Ângulo no instante zero; a posição é phase + speed · segundos */
  phase: number
  speed: number
  size: number
  urgent: boolean
  /** Ordem de proximidade do prazo entre os planetas (0 = o mais próximo) */
  rank: number
}

// Posiciona as metas para o instante `viewNow` (que pode estar no futuro,
// quando o usuário usa a viagem no tempo).
export function layoutSolar(goals: GoalListItem[], viewNow: number) {
  const hoursLeft = (goal: GoalListItem) =>
    (Date.parse(goal.deadline) - viewNow) / HOUR
  const open = goals.filter((goal) => !goal.isCompleted)

  const planets = open
    .filter((goal) => hoursLeft(goal) >= 0)
    .sort((a, b) => hoursLeft(a) - hoursLeft(b))
  const fallen = open.filter((goal) => hoursLeft(goal) < 0)

  const bodies: SolarBody[] = [
    ...planets.map((goal, index) => {
      const radius = radiusForHours(hoursLeft(goal))
      return {
        goal,
        kind: 'planet' as const,
        radius,
        phase: hashToUnit(goal.id) * TAU,
        speed: orbitalSpeed(radius),
        size: planetSize(goal.progress.total),
        urgent: hoursLeft(goal) <= 24,
        rank: index,
      }
    }),
    // As vencidas caem no horizonte, girando rápido perto do sol
    ...fallen.map((goal, index) => ({
      goal,
      kind: 'fallen' as const,
      radius: SOLAR.horizonRadius,
      phase: (index / fallen.length) * TAU,
      speed: orbitalSpeed(SOLAR.horizonRadius),
      size: 0.45,
      urgent: true,
      rank: Infinity,
    })),
  ]

  return {
    bodies,
    achieved: goals.filter((goal) => goal.isCompleted),
  }
}

/** Direção no céu (hemisfério de cima) onde fica a estrela de uma meta conquistada */
export function starDirection(id: string): [number, number, number] {
  const azimuth = hashToUnit(`${id}-az`) * TAU
  // Entre 9° e 39° acima do plano das órbitas: visíveis na perspectiva padrão
  const elevation = (0.15 + hashToUnit(`${id}-el`) * 0.5) * (Math.PI / 3)
  return [
    Math.cos(elevation) * Math.cos(azimuth),
    Math.sin(elevation),
    Math.cos(elevation) * Math.sin(azimuth),
  ]
}
