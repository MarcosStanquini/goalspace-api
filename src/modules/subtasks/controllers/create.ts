import { PrismaGoalsRepository } from '@/modules/goals/repositories/prisma/prisma-goals-repository'
import { z } from 'zod'
import { PrismaSubtaskRepository } from '../repositories/prisma/prisma-subtask-repository'
import { CreateSubTaskUseCase } from '../use-cases/create'
import { FastifyRequest, FastifyReply } from 'fastify'
import { GoalNotFound } from '@/modules/goals/use-cases/errors/goal-not-found'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createBodySchema = z.object({
    description: z.string(),
  })

  const createParamsSchema = z.object({
    goal_id: z.string().uuid(),
  })

  const { description } = createBodySchema.parse(request.body)
  const { goal_id } = createParamsSchema.parse(request.params)

  try {
    const prismaGoalsRepository = new PrismaGoalsRepository()
    const prismaSubtaskRepository = new PrismaSubtaskRepository()
    const subTaskUseCase = new CreateSubTaskUseCase(
      prismaSubtaskRepository,
      prismaGoalsRepository,
    )

    await subTaskUseCase.execute({
      description,
      goal_id,
    })
  } catch (err) {
    if (err instanceof GoalNotFound) {
      return reply.status(409).send({ message: err.message })
    }
    throw err
  }
  return reply.status(201).send()
}
