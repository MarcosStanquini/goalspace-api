import { GoalsRepository } from '@/modules/goals/repositories/goals-repository'
import { SubtaskRepository } from '../repositories/subtask-repository'
import { findUserSubtask } from './utils/find-user-subtask'

interface DeleteSubtaskUseCaseRequest {
  id: string
  user_id: string
}

export class DeleteSubtaskUseCase {
  constructor(
    private subtaskRepository: SubtaskRepository,
    private goalsRepository: GoalsRepository,
  ) {}

  async execute({ id, user_id }: DeleteSubtaskUseCaseRequest) {
    await findUserSubtask(
      this.subtaskRepository,
      this.goalsRepository,
      id,
      user_id,
    )

    await this.subtaskRepository.delete(id)
  }
}
