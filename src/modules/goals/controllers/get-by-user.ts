import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { PrismaGoalsRepository } from '../repositories/prisma/prisma-goals-repository'
import { GetGoalByUserUseCase } from '../use-cases/get-by-user'

export async function getGoalByUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    user_id: z.string().uuid(),
  })

  const { user_id } = paramsSchema.parse(request.params)

  const goalsRepository = new PrismaGoalsRepository()
  const getGoalByUser = new GetGoalByUserUseCase(goalsRepository)

  const goals = await getGoalByUser.execute({ user_id })

  return reply.status(200).send(goals)
}
