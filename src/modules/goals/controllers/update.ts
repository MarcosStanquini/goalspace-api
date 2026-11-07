import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { makeUpdateGoalUseCase } from '../use-cases/factories'
import { GoalNotFound } from '../use-cases/errors/goal-not-found'
import { InvalidDeadline } from '../use-cases/errors/invalid-deadline'
import { deadlineZodSchema } from '../schemas'

export async function updateGoal(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string().uuid(),
  })

  const updateBodySchema = z.object({
    title: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    deadline: deadlineZodSchema.optional(),
    isCompleted: z.boolean().optional(),
  })

  const { id } = paramsSchema.parse(request.params)
  const { title, description, deadline, isCompleted } = updateBodySchema.parse(
    request.body,
  )

  try {
    const updateGoalUseCase = makeUpdateGoalUseCase()
    const goal = await updateGoalUseCase.execute({
      user_id: request.user.sub,
      id,
      title,
      description,
      deadline,
      isCompleted,
    })

    return reply.status(200).send(goal)
  } catch (err) {
    if (err instanceof GoalNotFound) {
      return reply.status(404).send({ message: err.message })
    }
    if (err instanceof InvalidDeadline) {
      return reply.status(400).send({ message: err.message })
    }
    throw err
  }
}
