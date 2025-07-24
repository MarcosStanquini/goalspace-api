import { SubtaskRepository } from '@/modules/subtasks/repositories/subtask-repository'
import { GoalsRepository } from '../repositories/goals-repository'
import { GoalNotFound } from './errors/goal-not-found'

interface GetDetailsUseCaseRequest {
  id: string
}

export class GetDetailsUseCase {
  constructor(
    private goalsRepository: GoalsRepository,
    private subtasksRepository: SubtaskRepository,
  ) {}

  async execute({ id }: GetDetailsUseCaseRequest) {
    const goal = await this.goalsRepository.findById(id)

    if (!goal) {
      throw new GoalNotFound()
    }
    const subtasks = await this.subtasksRepository.findManyByGoalId(id)

    const subtasksWithoutGoalId = subtasks
      ? subtasks.map(({ id, description }) => ({
          id,
          description,
        }))
      : []

    const goalDetails = {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      deadline: goal.deadline,
      created_at: goal.created_at,
      subtasks: subtasksWithoutGoalId,
    }
    return goalDetails
  }
}
