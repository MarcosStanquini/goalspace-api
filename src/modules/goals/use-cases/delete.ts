import { SubtaskRepository } from '@/modules/subtasks/repositories/subtask-repository'
import { GoalsRepository } from '../repositories/goals-repository'
import { GoalNotFound } from './errors/goal-not-found'

interface DeleteGoalsUseCaseRequest {
  id: string
}

export class DeleteGoalUseCase {
  constructor(
    private goalsRepository: GoalsRepository,
    private subtaskRepository: SubtaskRepository,
  ) {}

  async execute({ id }: DeleteGoalsUseCaseRequest) {
    const goal = await this.goalsRepository.findById(id)

    if (!goal) {
      throw new GoalNotFound()
    }
    await this.subtaskRepository.deleteManyByGoalId(id)
    await this.goalsRepository.deleteById(id)
  }
}
