import { SubtaskRepository } from '@/modules/subtasks/repositories/subtask-repository'
import { toSubtaskResponse } from '@/modules/subtasks/use-cases/utils/to-subtask-response'
import { GoalsRepository } from '../repositories/goals-repository'
import { findUserGoal } from './utils/find-user-goal'
import { toGoalResponse } from './utils/to-goal-response'

interface GetDetailsUseCaseRequest {
  id: string
  user_id: string
}

export class GetDetailsUseCase {
  constructor(
    private goalsRepository: GoalsRepository,
    private subtasksRepository: SubtaskRepository,
  ) {}

  async execute({ id, user_id }: GetDetailsUseCaseRequest) {
    const goal = await findUserGoal(this.goalsRepository, id, user_id)
    const subtasks = await this.subtasksRepository.findManyByGoalId(id)

    return {
      ...toGoalResponse(goal),
      subtasks: subtasks.map(toSubtaskResponse),
    }
  }
}
