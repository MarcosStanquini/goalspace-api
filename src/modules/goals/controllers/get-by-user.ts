import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { PrismaGoalsRepository } from '../repositories/prisma/prisma-goals-repository'
import { GetGoalByUserUseCase } from '../use-cases/get-by-user'
import { GoalNotFound } from '../use-cases/errors/goal-not-found'

export async function getGoalByUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const queryParamsSchema = z.object({
    goal_status: z.enum(['active', 'expired', 'completed']).optional(),
    title_search: z.string().optional(),
  })

  const user_id = (request.user as { sub: string }).sub
  const { goal_status, title_search } = queryParamsSchema.parse(request.query)

  let goals

  try {
    const goalsRepository = new PrismaGoalsRepository()
    const getGoalByUser = new GetGoalByUserUseCase(goalsRepository)

    goals = await getGoalByUser.execute({ user_id, goal_status, title_search })
  } catch (err) {
    if (err instanceof GoalNotFound) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
  return reply.status(200).send(goals)
}
