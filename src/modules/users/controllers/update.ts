import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaUsersRepository } from '../repositories/prisma/prisma-users-repository'
import { UpdateUserUseCase } from '../use-cases/update'
import { UserNotExistsError } from '../use-cases/errors/user-not-found-error'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateBodyParams = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
  })

  const { name, email } = updateBodyParams.parse(request.body)
  const id = (request.user as { sub: string }).sub

  try {
    const usersRepository = new PrismaUsersRepository()
    const updateUserUseCase = new UpdateUserUseCase(usersRepository)

    const user = await updateUserUseCase.execute({ id, name, email })

    const userUpdated = {
      name: user.name,
      email: user.email,
    }

    return reply.status(200).send(userUpdated)
  } catch (err) {
    if (err instanceof UserNotExistsError) {
      return reply.status(404).send({ message: err.message })
    }
    throw err
  }
}
