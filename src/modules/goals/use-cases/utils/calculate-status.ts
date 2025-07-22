import { Goal } from '@prisma/client'

export function calculateStatus(
  goal: Goal,
): 'active' | 'completed' | 'expired' {
  const now = new Date()

  if (goal.isCompleted) {
    return 'completed'
  }
  if (goal.deadline.getTime() < now.getTime()) {
    return 'expired'
  }
  return 'active'
}
