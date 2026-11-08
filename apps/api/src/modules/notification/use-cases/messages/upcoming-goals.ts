import { Goal } from '@prisma/client'

// Metas ainda não concluídas cujo prazo cai na janela (agora, agora + windowInMs]
export function filterUpcomingGoals(goals: Goal[], windowInMs: number) {
  const now = Date.now()

  return goals.filter((goal) => {
    const deadline = goal.deadline.getTime()
    return !goal.isCompleted && deadline > now && deadline <= now + windowInMs
  })
}
