import { GoalsRepository } from '../repositories/goals-repository'
import { GoalNotFound } from './errors/goal-not-found'

interface MarkStatusCompletedRequest {
  user_id: string
  id: string
}

export class MarkStatusCompletedUseCase {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({ user_id, id }: MarkStatusCompletedRequest) {
    const goal = await this.goalsRepository.updateToCompleted(user_id, id)

    if (!goal) {
      throw new GoalNotFound()
    }
    return goal
  }
}
