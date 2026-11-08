import { SubtaskRepository } from '@/modules/subtasks/repositories/subtask-repository'
import { GoalsRepository } from '../repositories/goals-repository'
import { GoalStatus } from './utils/calculate-status'
import { toGoalResponse } from './utils/to-goal-response'

interface GetGoalByUserRequest {
  user_id: string
  goal_status?: GoalStatus
  title_search?: string
}

export class GetGoalByUserUseCase {
  constructor(
    private goalsRepository: GoalsRepository,
    private subtasksRepository: SubtaskRepository,
  ) {}

  async execute({ user_id, goal_status, title_search }: GetGoalByUserRequest) {
    const goals = await this.goalsRepository.findManyByUserId(
      user_id,
      title_search,
    )

    const subtasks = await this.subtasksRepository.findManyByGoalIds(
      goals.map((goal) => goal.id),
    )

    // O status é calculado (não fica no banco), por isso o filtro é feito aqui
    const goalsWithStatus = goals.map((goal) => {
      const goalSubtasks = subtasks.filter(
        (subtask) => subtask.goal_id === goal.id,
      )

      return {
        ...toGoalResponse(goal),
        progress: {
          total: goalSubtasks.length,
          completed: goalSubtasks.filter((subtask) => subtask.isCompleted)
            .length,
        },
      }
    })

    return goal_status
      ? goalsWithStatus.filter((goal) => goal.goal_status === goal_status)
      : goalsWithStatus
  }
}
