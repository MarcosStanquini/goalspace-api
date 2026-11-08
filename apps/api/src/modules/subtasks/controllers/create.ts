import { z } from 'zod'
import { FastifyRequest, FastifyReply } from 'fastify'
import { makeCreateSubTaskUseCase } from '../use-cases/factories'
import { GoalNotFound } from '@/modules/goals/use-cases/errors/goal-not-found'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createBodySchema = z.object({
    description: z.string().trim().min(1),
  })

  const createParamsSchema = z.object({
    goal_id: z.string().uuid(),
  })

  const { description } = createBodySchema.parse(request.body)
  const { goal_id } = createParamsSchema.parse(request.params)

  try {
    const createSubTaskUseCase = makeCreateSubTaskUseCase()
    const subtask = await createSubTaskUseCase.execute({
      description,
      goal_id,
      user_id: request.user.sub,
    })

    return reply.status(201).send(subtask)
  } catch (err) {
    if (err instanceof GoalNotFound) {
      return reply.status(404).send({ message: err.message })
    }
    throw err
  }
}
