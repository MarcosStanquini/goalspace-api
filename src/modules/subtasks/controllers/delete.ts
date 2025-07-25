import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaSubtaskRepository } from '../repositories/prisma/prisma-subtask-repository'
import { DeleteSubtaskUseCase } from '../use-cases/delete'
import { SubTaskNotFound } from '../use-cases/errors/subtasks-not-found'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteParamsSchema = z.object({
    id: z.string().uuid(),
  })

  const { id } = deleteParamsSchema.parse(request.params)

  try {
    const prismaSubtaskRepository = new PrismaSubtaskRepository()
    const deleteSubtaskUseCase = new DeleteSubtaskUseCase(
      prismaSubtaskRepository,
    )

    await deleteSubtaskUseCase.execute({ id })
  } catch (err) {
    if (err instanceof SubTaskNotFound) {
      return reply.status(404).send({ message: err.message })
    }
    throw err
  }
  return reply.status(204).send()
}
