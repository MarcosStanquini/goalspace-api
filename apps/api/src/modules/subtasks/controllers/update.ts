import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeUpdateSubTaskUseCase } from '../use-cases/factories'
import { SubTaskNotFound } from '../use-cases/errors/subtasks-not-found'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateBodySchema = z.object({
    description: z.string().trim().min(1).optional(),
    isCompleted: z.boolean().optional(),
  })

  const requestParams = z.object({
    id: z.string().uuid(),
  })

  const { id } = requestParams.parse(request.params)
  const { description, isCompleted } = updateBodySchema.parse(request.body)

  try {
    const updateSubTaskUseCase = makeUpdateSubTaskUseCase()
    const subtask = await updateSubTaskUseCase.execute({
      id,
      user_id: request.user.sub,
      description,
      isCompleted,
    })

    return reply.status(200).send(subtask)
  } catch (err) {
    if (err instanceof SubTaskNotFound) {
      return reply.status(404).send({ message: err.message })
    }
    throw err
  }
}
