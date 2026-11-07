import { GoalsRepository } from '../repositories/goals-repository'
import { findUserGoal } from './utils/find-user-goal'

interface DeleteGoalsUseCaseRequest {
  id: string
  user_id: string
}

export class DeleteGoalUseCase {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({ id, user_id }: DeleteGoalsUseCaseRequest) {
    await findUserGoal(this.goalsRepository, id, user_id)

    await this.goalsRepository.delete(id)
  }
}
