import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { PrismaGoalsRepository } from '../repositories/prisma/prisma-goals-repository'
import { MarkStatusCompletedUseCase } from '../use-cases/mark-completed'
import { GoalNotFound } from '../use-cases/errors/goal-not-found'

export async function markStatusCompleted(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    user_id: z.string().uuid(),
    id: z.string().uuid(),
  })

  const { user_id, id } = paramsSchema.parse(request.params)
  console.log(user_id)
  console.log(id)

  let goal

  try {
    const goalsRepository = new PrismaGoalsRepository()
    const markStatusCompleted = new MarkStatusCompletedUseCase(goalsRepository)

    goal = await markStatusCompleted.execute({ user_id, id })
  } catch (err) {
    if (err instanceof GoalNotFound) {
      return reply.status(404).send({ message: err.message })
    }
    throw err
  }
  return reply.status(200).send(goal)
}
