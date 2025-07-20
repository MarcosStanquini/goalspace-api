import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { PrismaGoalsRepository } from '../repositories/prisma/prisma-goals-repository'
import { GetGoalByUserUseCase } from '../use-cases/get-by-user'
import { GoalsNotExists } from '../use-cases/errors/goals-not-exists'

export async function getGoalByUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    user_id: z.string().uuid(),
  })

  const { user_id } = paramsSchema.parse(request.params)
  let goals

  try {
    const goalsRepository = new PrismaGoalsRepository()
    const getGoalByUser = new GetGoalByUserUseCase(goalsRepository)

    goals = await getGoalByUser.execute({ user_id })
  } catch (err) {
    if (err instanceof GoalsNotExists) {
      return reply.status(409).send({ message: err.message })
    }

    throw err
  }
  return reply.status(200).send(goals)
}
