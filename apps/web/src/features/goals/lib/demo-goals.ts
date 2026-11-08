import type { GoalListItem } from '../types'

const DAY = 24 * 60 * 60 * 1000

const DEMO = [
  ['Entregar o portfólio', 0.5, 4, 3],
  ['Correr 10 km', 5, 5, 2],
  ['Ler 12 livros', 20, 6, 4],
  ['Aprender inglês', 60, 3, 1],
  ['Viagem para o Chile', 150, 4, 0],
  ['Renovar o passaporte', 2, 0, 0],
] as const

// Dados de exemplo só para ilustrar a carta nas telas de login e cadastro
export function createDemoGoals(now: number): GoalListItem[] {
  const planned = DEMO.map(([title, days, total, completed], index) => ({
    id: `demo-${index}`,
    title,
    description: null,
    deadline: new Date(now + days * DAY).toISOString(),
    created_at: new Date(now).toISOString(),
    isCompleted: false,
    goal_status: 'active' as const,
    progress: { total, completed },
  }))
  const achieved = ['a', 'b', 'c', 'd', 'e'].map((key) => ({
    id: `demo-star-${key}`,
    title: 'Meta conquistada',
    description: null,
    deadline: new Date(now).toISOString(),
    created_at: new Date(now).toISOString(),
    isCompleted: true,
    goal_status: 'completed' as const,
    progress: { total: 0, completed: 0 },
  }))

  return [...planned, ...achieved]
}
