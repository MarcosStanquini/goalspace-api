import { FastifyReply, FastifyRequest } from 'fastify'
import { ExportPdfUseCase } from '../use-cases/export-pdf'
import { PrismaUsersRepository } from '../../repositories/prisma/prisma-users-repository'
import { PrismaGoalsRepository } from '@/modules/goals/repositories/prisma/prisma-goals-repository'
import { PrismaSubtaskRepository } from '@/modules/subtasks/repositories/prisma/prisma-subtask-repository'

export async function exportPdf(request: FastifyRequest, reply: FastifyReply) {
  const id = (request.user as { sub: string }).sub

  try {
    const usersRepository = new PrismaUsersRepository()
    const goalsRepository = new PrismaGoalsRepository()
    const subtasksRepository = new PrismaSubtaskRepository()

    const exportPdfUseCase = new ExportPdfUseCase(
      usersRepository,
      goalsRepository,
      subtasksRepository,
    )

    const pdfBuffer = await exportPdfUseCase.execute({ id })
    return reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `attachment; filename=relatorio-${id}.pdf`)
      .send(pdfBuffer)
  } catch (err) {
    reply.status(404).send({ message: 'Users or goals not found!' })
  }
}
