import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { makeGetDetailsUseCase } from '../use-cases/factories'
import { GoalNotFound } from '../use-cases/errors/goal-not-found'

export async function getDetails(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string().uuid(),
  })

  const { id } = paramsSchema.parse(request.params)

  try {
    const getDetailsUseCase = makeGetDetailsUseCase()
    const goal = await getDetailsUseCase.execute({
      id,
      user_id: request.user.sub,
    })

    return reply.status(200).send(goal)
  } catch (err) {
    if (err instanceof GoalNotFound) {
      return reply.status(404).send({ message: err.message })
    }
    throw err
  }
}
