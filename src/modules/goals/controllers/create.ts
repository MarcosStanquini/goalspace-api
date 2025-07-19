import { FastifyRequest, FastifyReply } from 'fastify'
import z from 'zod'
import { PrismaGoalsRepository } from '../repositories/prisma/prisma-goals-repository'
import { CreateGoalUseCase } from '../use-cases/create'
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma/prisma-users-repository'
import { UserNotExists } from '@/modules/users/use-cases/errors/user-not-exists-error'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createBodySchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    deadline: z.coerce.date(),
    user_id: z.string().uuid(),
  })

  const { title, description, deadline, user_id } = createBodySchema.parse(
    request.body,
  )

  try {
    const prismaGoalsRepository = new PrismaGoalsRepository()
    const prismaUsersRepository = new PrismaUsersRepository()
    const goalsUseCase = new CreateGoalUseCase(
      prismaGoalsRepository,
      prismaUsersRepository,
    )

    await goalsUseCase.execute({
      title,
      description,
      deadline,
      user_id,
    })
  } catch (err) {
    if (err instanceof UserNotExists) {
      return reply.status(409).send({ message: err.message })
    }
    throw err
  }
  return reply.status(201).send()
}
