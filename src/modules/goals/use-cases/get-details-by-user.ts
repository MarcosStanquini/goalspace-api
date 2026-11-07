import { SubtaskRepository } from '@/modules/subtasks/repositories/subtask-repository'
import { toSubtaskResponse } from '@/modules/subtasks/use-cases/utils/to-subtask-response'
import { GoalsRepository } from '../repositories/goals-repository'
import { toGoalResponse } from './utils/to-goal-response'

interface GetDetailsByUserUseCaseRequest {
  user_id: string
}

export class GetDetailsByUserUseCase {
  constructor(
    private goalsRepository: GoalsRepository,
    private subtasksRepository: SubtaskRepository,
  ) {}

  async execute({ user_id }: GetDetailsByUserUseCaseRequest) {
    const goals = await this.goalsRepository.findManyByUserId(user_id)

    // Busca todas as subtarefas de uma vez (evita uma query por meta)
    const subtasks = await this.subtasksRepository.findManyByGoalIds(
      goals.map((goal) => goal.id),
    )

    return goals.map((goal) => ({
      ...toGoalResponse(goal),
      subtasks: subtasks
        .filter((subtask) => subtask.goal_id === goal.id)
        .map(toSubtaskResponse),
    }))
  }
}
