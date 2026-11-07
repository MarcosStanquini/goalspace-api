import { SubtaskRepository } from '@/modules/subtasks/repositories/subtask-repository'
import { GoalsRepository } from '../repositories/goals-repository'
import { calculateStatus, GoalStatus } from './utils/calculate-status'

interface GetGoalsSummaryUseCaseRequest {
  user_id: string
}

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000

// Dashboard resumido do progresso do usuário (RF14)
export class GetGoalsSummaryUseCase {
  constructor(
    private goalsRepository: GoalsRepository,
    private subtasksRepository: SubtaskRepository,
  ) {}

  async execute({ user_id }: GetGoalsSummaryUseCaseRequest) {
    const goals = await this.goalsRepository.findManyByUserId(user_id)
    const subtasks = await this.subtasksRepository.findManyByGoalIds(
      goals.map((goal) => goal.id),
    )

    const statuses = goals.map(calculateStatus)
    const count = (status: GoalStatus) =>
      statuses.filter((goalStatus) => goalStatus === status).length

    const completed = count('completed')
    const now = Date.now()

    return {
      goals: {
        total: goals.length,
        active: count('active'),
        completed,
        expired: count('expired'),
        // Metas em aberto com prazo nos próximos 7 dias
        due_soon: goals.filter(
          (goal) =>
            !goal.isCompleted &&
            goal.deadline.getTime() >= now &&
            goal.deadline.getTime() <= now + SEVEN_DAYS_IN_MS,
        ).length,
      },
      subtasks: {
        total: subtasks.length,
        completed: subtasks.filter((subtask) => subtask.isCompleted).length,
      },
      completion_rate:
        goals.length === 0 ? 0 : Math.round((completed / goals.length) * 100),
    }
  }
}
