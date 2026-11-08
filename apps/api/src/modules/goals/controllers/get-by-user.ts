import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { makeGetGoalByUserUseCase } from '../use-cases/factories'

export async function getGoalByUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const queryParamsSchema = z.object({
    goal_status: z.enum(['active', 'expired', 'completed']).optional(),
    title_search: z.string().optional(),
  })

  const { goal_status, title_search } = queryParamsSchema.parse(request.query)

  const getGoalByUserUseCase = makeGetGoalByUserUseCase()
  const goals = await getGoalByUserUseCase.execute({
    user_id: request.user.sub,
    goal_status,
    title_search,
  })

  return reply.status(200).send(goals)
}
