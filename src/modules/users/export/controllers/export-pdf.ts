import { FastifyReply, FastifyRequest } from 'fastify'
import { makeExportPdfUseCase } from '../use-cases/factories'
import { UserNotExistsError } from '../../use-cases/errors/user-not-found-error'

export async function exportPdf(request: FastifyRequest, reply: FastifyReply) {
  try {
    const exportPdfUseCase = makeExportPdfUseCase()
    const pdfBuffer = await exportPdfUseCase.execute({ id: request.user.sub })

    return reply
      .header('Content-Type', 'application/pdf')
      .header(
        'Content-Disposition',
        'attachment; filename="relatorio-metas.pdf"',
      )
      .send(pdfBuffer)
  } catch (err) {
    if (err instanceof UserNotExistsError) {
      return reply.status(404).send({ message: err.message })
    }
    throw err
  }
}
