import { GoalsRepository } from '../repositories/goals-repository'
import { GoalNotFound } from './errors/goal-not-found'
import { InvalidDeadline } from './errors/invalid-deadline'

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
    if (deadline) {
      const isInPast = deadline.getTime() < Date.now()

      if (isInPast && !isCompleted) {
        throw new InvalidDeadline()
      }
    }

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
