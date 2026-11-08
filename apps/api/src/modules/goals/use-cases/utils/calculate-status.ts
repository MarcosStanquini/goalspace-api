import { Goal } from '@prisma/client'

export type GoalStatus = 'active' | 'completed' | 'expired'

export function calculateStatus(
  goal: Pick<Goal, 'isCompleted' | 'deadline'>,
): GoalStatus {
  if (goal.isCompleted) {
    return 'completed'
  }
  if (goal.deadline.getTime() < Date.now()) {
    return 'expired'
  }
  return 'active'
}
