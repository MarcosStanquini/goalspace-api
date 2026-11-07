import { GoalsRepository } from '@/modules/goals/repositories/goals-repository'
import { SubtaskRepository } from '../repositories/subtask-repository'
import { findUserSubtask } from './utils/find-user-subtask'
import { toSubtaskResponse } from './utils/to-subtask-response'

interface UpdateSubTaskUseCaseRequest {
  id: string
  user_id: string
  description?: string
  isCompleted?: boolean
}

export class UpdateSubTaskUseCase {
  constructor(
    private subtaskRepository: SubtaskRepository,
    private goalsRepository: GoalsRepository,
  ) {}

  async execute({
    id,
    user_id,
    description,
    isCompleted,
  }: UpdateSubTaskUseCaseRequest) {
    await findUserSubtask(
      this.subtaskRepository,
      this.goalsRepository,
      id,
      user_id,
    )

    const subtask = await this.subtaskRepository.update(id, {
      description,
      isCompleted,
    })

    return toSubtaskResponse(subtask)
  }
}
