import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { PrismaGoalsRepository } from '../repositories/prisma/prisma-goals-repository'
import { PrismaSubtaskRepository } from '@/modules/subtasks/repositories/prisma/prisma-subtask-repository'
import { GetDetailsUseCase } from '../use-cases/get-details'
import { GoalNotFound } from '../use-cases/errors/goal-not-found'
import { SubTaskNotFound } from '@/modules/subtasks/use-cases/errors/subtasks-not-found'

export async function getDetails(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string().uuid(),
  })

  const { id } = paramsSchema.parse(request.params)
  let goal
  try {
    const goalsRepository = new PrismaGoalsRepository()
    const subtasksRepository = new PrismaSubtaskRepository()
    const getDetailsUseCase = new GetDetailsUseCase(
      goalsRepository,
      subtasksRepository,
    )
    goal = await getDetailsUseCase.execute({ id })
  } catch (err) {
    if (err instanceof GoalNotFound) {
      return reply.status(404).send({ message: err.message })
    }

    if (err instanceof SubTaskNotFound) {
      return reply.status(404).send({ message: err.message })
    }
    throw err
  }
  return reply.status(200).send(goal)
}
