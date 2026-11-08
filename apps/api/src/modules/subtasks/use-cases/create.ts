import { GoalsRepository } from '@/modules/goals/repositories/goals-repository'
import { findUserGoal } from '@/modules/goals/use-cases/utils/find-user-goal'
import { SubtaskRepository } from '../repositories/subtask-repository'
import { toSubtaskResponse } from './utils/to-subtask-response'

interface CreateSubTaskUseCaseRequest {
  description: string
  goal_id: string
  user_id: string
}

export class CreateSubTaskUseCase {
  constructor(
    private subtaskRepository: SubtaskRepository,
    private goalsRepository: GoalsRepository,
  ) {}

  async execute({
    description,
    goal_id,
    user_id,
  }: CreateSubTaskUseCaseRequest) {
    await findUserGoal(this.goalsRepository, goal_id, user_id)

    const subtask = await this.subtaskRepository.create({
      description,
      goal_id,
    })

    return toSubtaskResponse(subtask)
  }
}
