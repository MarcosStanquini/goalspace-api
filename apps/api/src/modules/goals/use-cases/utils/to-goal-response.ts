import { Goal } from '@prisma/client'
import { calculateStatus } from './calculate-status'

// Formato público de uma meta, já com o status calculado
export function toGoalResponse(goal: Goal) {
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    deadline: goal.deadline,
    created_at: goal.created_at,
    isCompleted: goal.isCompleted,
    goal_status: calculateStatus(goal),
  }
}

export type GoalResponse = ReturnType<typeof toGoalResponse>
