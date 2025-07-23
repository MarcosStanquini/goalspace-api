import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { PrismaGoalsRepository } from '../repositories/prisma/prisma-goals-repository'
import { UpdateGoalUseCase } from '../use-cases/update'
import { GoalNotFound } from '../use-cases/errors/goal-not-found'

export async function updateGoal(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string().uuid(),
  })

  const updateBodySchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    deadline: z.date().optional(),
    isCompleted: z.boolean().optional(),
  })

  const user_id = (request.user as { sub: string }).sub
  const { id } = paramsSchema.parse(request.params)
  const { title, description, deadline, isCompleted } = updateBodySchema.parse(
    request.body,
  )

  let goal

  try {
    const goalsRepository = new PrismaGoalsRepository()
    const updateGoal = new UpdateGoalUseCase(goalsRepository)

    goal = await updateGoal.execute({
      user_id,
      id,
      title,
      description,
      deadline,
      isCompleted,
    })
  } catch (err) {
    if (err instanceof GoalNotFound) {
      return reply.status(404).send({ message: err.message })
    }
    throw err
  }
  return reply.status(200).send(goal)
}
