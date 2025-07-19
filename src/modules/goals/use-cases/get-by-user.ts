import { GoalsRepository } from '../repositories/goals-repository'
import { GoalsNotExists } from './errors/goals-not-exists'

interface GetGoalByUserRequest {
  user_id: string
}

export class GetGoalByUserUseCase {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({ user_id }: GetGoalByUserRequest) {
    const goals = await this.goalsRepository.findManyByUserId(user_id)

    if (!goals) {
      throw new GoalsNotExists()
    }

    return goals
  }
}
