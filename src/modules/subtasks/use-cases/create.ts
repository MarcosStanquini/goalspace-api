import { GoalsRepository } from '@/modules/goals/repositories/goals-repository'
import { SubtaskRepository } from '../repositories/subtask-repository'
import { GoalNotFound } from '@/modules/goals/use-cases/errors/goal-not-found'

interface CreateSubTaskUseCaseRequest {
  description: string
  goal_id: string
}

export class CreateSubTaskUseCase {
  constructor(
    private subtaskRepository: SubtaskRepository,
    private goalsRepository: GoalsRepository,
  ) {}

  async execute({ description, goal_id }: CreateSubTaskUseCaseRequest) {
    const goal = await this.goalsRepository.findById(goal_id)

    if (!goal) {
      throw new GoalNotFound()
    }
    const subTask = await this.subtaskRepository.create({
      description,
      goal_id,
    })
    return subTask
  }
}
