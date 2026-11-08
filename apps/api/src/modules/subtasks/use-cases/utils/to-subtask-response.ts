import { SubTask } from '@prisma/client'

export function toSubtaskResponse(subtask: SubTask) {
  return {
    id: subtask.id,
    goal_id: subtask.goal_id,
    description: subtask.description,
    isCompleted: subtask.isCompleted,
  }
}
