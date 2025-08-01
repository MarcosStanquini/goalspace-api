import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaSubtaskRepository } from '../repositories/prisma/prisma-subtask-repository'
import { UpdateSubTaskUseCase } from '../use-cases/update'
import { SubTaskNotFound } from '../use-cases/errors/subtasks-not-found'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateBodySchema = z.object({
    description: z.string().optional(),
    isCompleted: z.boolean().optional(),
  })

  const requestParams = z.object({
    id: z.string().uuid(),
  })

  const { id } = requestParams.parse(request.params)
  const { description, isCompleted } = updateBodySchema.parse(request.body)

  try {
    const subTaskRepository = new PrismaSubtaskRepository()
    const updateSubTaskUseCase = new UpdateSubTaskUseCase(subTaskRepository)

    const subTask = await updateSubTaskUseCase.execute({
      id,
      description,
      isCompleted,
    })

    return reply.status(200).send(subTask)
  } catch (err) {
    if (err instanceof SubTaskNotFound) {
      return reply.status(404).send({ message: err.message })
    }
    throw err
  }
}
