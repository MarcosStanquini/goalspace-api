import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeDeleteSubtaskUseCase } from '../use-cases/factories'
import { SubTaskNotFound } from '../use-cases/errors/subtasks-not-found'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteParamsSchema = z.object({
    id: z.string().uuid(),
  })

  const { id } = deleteParamsSchema.parse(request.params)

  try {
    const deleteSubtaskUseCase = makeDeleteSubtaskUseCase()
    await deleteSubtaskUseCase.execute({ id, user_id: request.user.sub })

    return reply.status(204).send()
  } catch (err) {
    if (err instanceof SubTaskNotFound) {
      return reply.status(404).send({ message: err.message })
    }
    throw err
  }
}
