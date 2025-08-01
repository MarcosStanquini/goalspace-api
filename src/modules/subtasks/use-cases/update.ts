import { SubtaskRepository } from '../repositories/subtask-repository'
import { SubTaskNotFound } from './errors/subtasks-not-found'

interface UpdateSubTaskUseCaseRequest {
  id: string
  description?: string
  isCompleted?: boolean
}

export class UpdateSubTaskUseCase {
  constructor(private subTaskRepository: SubtaskRepository) {}

  async execute({ id, description, isCompleted }: UpdateSubTaskUseCaseRequest) {
    const subtask = await this.subTaskRepository.update(id, {
      description,
      isCompleted,
    })

    if (!subtask) {
      throw new SubTaskNotFound()
    }
    return subtask
  }
}
