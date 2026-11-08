import { GoalsRepository } from '@/modules/goals/repositories/goals-repository'
import { SubtaskRepository } from '@/modules/subtasks/repositories/subtask-repository'
import { UsersRepository } from '../../repositories/users-repository'
import { UserNotExistsError } from '../../use-cases/errors/user-not-found-error'
import { PdfGeneratorService } from '../services/export-pdf'
import { GetDetailsByUserUseCase } from '@/modules/goals/use-cases/get-details-by-user'

interface ExportPdfUseCaseRequest {
  id: string
}

export class ExportPdfUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private goalsRepository: GoalsRepository,
    private subtasksRepository: SubtaskRepository,
  ) {}

  async execute({ id }: ExportPdfUseCaseRequest) {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      throw new UserNotExistsError()
    }

    const getDetailsUseCase = new GetDetailsByUserUseCase(
      this.goalsRepository,
      this.subtasksRepository,
    )
    const goals = await getDetailsUseCase.execute({ user_id: id })

    const pdfGeneratorService = new PdfGeneratorService()
    const pdf = await pdfGeneratorService.generate({
      user: { name: user.name, email: user.email },
      goals,
    })

    return pdf
  }
}
