import { PrismaGoalsRepository } from '@/modules/goals/repositories/prisma/prisma-goals-repository'
import { PrismaSubtaskRepository } from '@/modules/subtasks/repositories/prisma/prisma-subtask-repository'
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma/prisma-users-repository'
import { ExportPdfUseCase } from '../export-pdf'

export function makeExportPdfUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const goalsRepository = new PrismaGoalsRepository()
  const subtasksRepository = new PrismaSubtaskRepository()

  return new ExportPdfUseCase(
    usersRepository,
    goalsRepository,
    subtasksRepository,
  )
}
