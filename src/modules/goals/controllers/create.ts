import { FastifyRequest, FastifyReply } from 'fastify'
import z from 'zod'
import { makeCreateGoalUseCase } from '../use-cases/factories'
import { UserNotExistsError } from '@/modules/users/use-cases/errors/user-not-found-error'
import { InvalidDeadline } from '../use-cases/errors/invalid-deadline'
import { deadlineZodSchema } from '../schemas'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createBodySchema = z.object({
    title: z.string().trim().min(1),
    description: z.string().optional(),
    deadline: deadlineZodSchema,
  })

  const { title, description, deadline } = createBodySchema.parse(request.body)

  try {
    const createGoalUseCase = makeCreateGoalUseCase()
    const goal = await createGoalUseCase.execute({
      title,
      description,
      deadline,
      user_id: request.user.sub,
    })

    return reply.status(201).send(goal)
  } catch (err) {
    if (err instanceof UserNotExistsError) {
      return reply.status(404).send({ message: err.message })
    }
    if (err instanceof InvalidDeadline) {
      return reply.status(400).send({ message: err.message })
    }
    throw err
  }
}
