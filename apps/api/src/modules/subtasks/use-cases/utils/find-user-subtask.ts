import { GoalsRepository } from '@/modules/goals/repositories/goals-repository'
import { SubtaskRepository } from '../../repositories/subtask-repository'
import { SubTaskNotFound } from '../errors/subtasks-not-found'

// Busca a subtarefa garantindo que a meta dela pertence ao usuário
export async function findUserSubtask(
  subtaskRepository: SubtaskRepository,
  goalsRepository: GoalsRepository,
  subtask_id: string,
  user_id: string,
) {
  const subtask = await subtaskRepository.findById(subtask_id)

  if (!subtask) {
    throw new SubTaskNotFound()
  }

  const goal = await goalsRepository.findById(subtask.goal_id)

  if (!goal || goal.user_id !== user_id) {
    throw new SubTaskNotFound()
  }

  return subtask
}
