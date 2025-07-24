import { SubtaskRepository } from '../repositories/subtask-repository'
import { SubTaskNotFound } from './errors/subtasks-not-found'

interface DeleteSubtaskUseCaseRequest {
  id: string
}

export class DeleteSubtaskUseCase {
  constructor(private subtaskRepository: SubtaskRepository) {}

  async execute({ id }: DeleteSubtaskUseCaseRequest) {
    const wasDeleted = await this.subtaskRepository.delete(id)

    if (!wasDeleted) {
      throw new SubTaskNotFound()
    }
    return { message: 'Deleted successfully' }
  }
}
