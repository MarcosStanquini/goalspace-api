import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { makeDeleteGoalUseCase } from '../use-cases/factories'
import { GoalNotFound } from '../use-cases/errors/goal-not-found'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteParamsSchema = z.object({
    id: z.string().uuid(),
  })

  const { id } = deleteParamsSchema.parse(request.params)

  try {
    const deleteGoalUseCase = makeDeleteGoalUseCase()
    await deleteGoalUseCase.execute({ id, user_id: request.user.sub })

    return reply.status(204).send()
  } catch (err) {
    if (err instanceof GoalNotFound) {
      return reply.status(404).send({ message: err.message })
    }
    throw err
  }
}
