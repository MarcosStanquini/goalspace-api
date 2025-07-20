import { GoalsRepository } from '../repositories/goals-repository'
import { GoalNotFound } from './errors/goal-not-found'

interface UpdateGoalUseCaseRequest {
  user_id: string
  id: string
  title?: string
  description?: string
  deadline?: Date
  isCompleted?: boolean
}

export class UpdateGoalUseCase {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({
    user_id,
    id,
    title,
    description,
    deadline,
    isCompleted,
  }: UpdateGoalUseCaseRequest) {
    const goal = await this.goalsRepository.update(user_id, id, {
      title,
      description,
      deadline,
      isCompleted,
    })

    if (!goal) {
      throw new GoalNotFound()
    }
    return goal
  }
}
