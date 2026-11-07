import { FastifyReply, FastifyRequest } from 'fastify'
import { makeGetGoalsSummaryUseCase } from '../use-cases/factories'

export async function getSummary(request: FastifyRequest, reply: FastifyReply) {
  const getGoalsSummaryUseCase = makeGetGoalsSummaryUseCase()
  const summary = await getGoalsSummaryUseCase.execute({
    user_id: request.user.sub,
  })

  return reply.status(200).send(summary)
}
