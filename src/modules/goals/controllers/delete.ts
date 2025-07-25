import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { PrismaGoalsRepository } from '../repositories/prisma/prisma-goals-repository'
import { PrismaSubtaskRepository } from '@/modules/subtasks/repositories/prisma/prisma-subtask-repository'
import { DeleteGoalUseCase } from '../use-cases/delete'
import { GoalNotFound } from '../use-cases/errors/goal-not-found'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteParamsSchema = z.object({
    id: z.string().uuid(),
  })

  const { id } = deleteParamsSchema.parse(request.params)

  try {
    const goalsRepository = new PrismaGoalsRepository()
    const subtaskRepository = new PrismaSubtaskRepository()
    const deleteGoalsUseCase = new DeleteGoalUseCase(
      goalsRepository,
      subtaskRepository,
    )

    deleteGoalsUseCase.execute({
      id,
    })
  } catch (err) {
    if (err instanceof GoalNotFound) {
      return reply.status(404).send({ message: err.message })
    }
    throw err
  }
  return reply.status(204).send()
}
