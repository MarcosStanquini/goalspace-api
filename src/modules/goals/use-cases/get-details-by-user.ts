import { SubtaskRepository } from '@/modules/subtasks/repositories/subtask-repository'
import { GoalsRepository } from '../repositories/goals-repository'
import { GoalNotFound } from './errors/goal-not-found'
import { SubTaskNotFound } from '@/modules/subtasks/use-cases/errors/subtasks-not-found'
import { calculateStatus } from './utils/calculate-status'

interface GetDetailsByUserUseCaseRequest {
  user_id: string
}

interface SubtaskDetail {
  id: string
  description: string
  isCompleted: boolean
}

interface GoalDetail {
  id: string
  title: string
  description: string | null
  deadline: Date
  created_at: Date
  goal_status: 'active' | 'expired' | 'completed'
  subtasks: SubtaskDetail[]
}

export class GetDetailsByUserUseCase {
  constructor(
    private goalsRepository: GoalsRepository,
    private subtasksRepository: SubtaskRepository,
  ) {}

  async execute({
    user_id,
  }: GetDetailsByUserUseCaseRequest): Promise<GoalDetail[]> {
    const goals = await this.goalsRepository.findManyByUserId(user_id)

    if (!goals || goals.length === 0) {
      throw new GoalNotFound()
    }

    const goalDetails: GoalDetail[] = []

    for (const goal of goals) {
      const subtasks = await this.subtasksRepository.findManyByGoalId(goal.id)

      if (!subtasks) {
        throw new SubTaskNotFound()
      }

      const formattedSubtasks: SubtaskDetail[] = subtasks.map(
        ({ id, description, isCompleted }) => ({
          id,
          description,
          isCompleted,
        }),
      )

      goalDetails.push({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        deadline: goal.deadline,
        created_at: goal.created_at,
        goal_status: calculateStatus(goal),
        subtasks: formattedSubtasks,
      })
    }

    return goalDetails
  }
}
