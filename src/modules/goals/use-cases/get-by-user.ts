import { GoalsRepository } from '../repositories/goals-repository'
import { GoalNotFound } from './errors/goal-not-found'
import { calculateStatus } from './utils/calculate-status'

interface GetGoalByUserRequest {
  user_id: string
  goal_status?: 'active' | 'expired' | 'completed'
  title_search?: string
}

export class GetGoalByUserUseCase {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({ user_id, goal_status, title_search }: GetGoalByUserRequest) {
    const goals = await this.goalsRepository.findManyByUserId(
      user_id,
      title_search,
    )

    if (!goals || goals.length === 0) {
      throw new GoalNotFound()
    }

    const goalsWithStatus = goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      description: goal.description,
      deadline: goal.deadline,
      created_at: goal.created_at,
      goal_status: calculateStatus(goal),
    }))

    const filteredGoals = goal_status
      ? goalsWithStatus.filter((goal) => goal.goal_status === goal_status)
      : goalsWithStatus

    return filteredGoals
  }
}
