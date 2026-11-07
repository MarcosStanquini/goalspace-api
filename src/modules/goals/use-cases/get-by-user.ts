import { GoalsRepository } from '../repositories/goals-repository'
import { GoalStatus } from './utils/calculate-status'
import { toGoalResponse } from './utils/to-goal-response'

interface GetGoalByUserRequest {
  user_id: string
  goal_status?: GoalStatus
  title_search?: string
}

export class GetGoalByUserUseCase {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({ user_id, goal_status, title_search }: GetGoalByUserRequest) {
    const goals = await this.goalsRepository.findManyByUserId(
      user_id,
      title_search,
    )

    // O status é calculado (não fica no banco), por isso o filtro é feito aqui
    const goalsWithStatus = goals.map(toGoalResponse)

    return goal_status
      ? goalsWithStatus.filter((goal) => goal.goal_status === goal_status)
      : goalsWithStatus
  }
}
