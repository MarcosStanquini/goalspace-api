import { GoalsRepository } from '../repositories/goals-repository'
import { InvalidDeadline } from './errors/invalid-deadline'
import { findUserGoal } from './utils/find-user-goal'
import { toGoalResponse } from './utils/to-goal-response'

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
    const goal = await findUserGoal(this.goalsRepository, id, user_id)

    if (deadline) {
      const isInPast = deadline.getTime() < Date.now()
      const willBeCompleted = isCompleted ?? goal.isCompleted

      if (isInPast && !willBeCompleted) {
        throw new InvalidDeadline()
      }
    }

    const updatedGoal = await this.goalsRepository.update(id, {
      title,
      description,
      deadline,
      isCompleted,
    })

    return toGoalResponse(updatedGoal)
  }
}
