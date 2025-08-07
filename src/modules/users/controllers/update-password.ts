import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { PrismaUsersRepository } from '../repositories/prisma/prisma-users-repository'
import { UpdatePasswordUseCase } from '../use-cases/update-password'
import { UserNotExistsError } from '../use-cases/errors/user-not-found-error'
import { InvalidCredentials } from '@/modules/auth/use-cases/errors/invalid-credentials'

export async function updatePassword(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updatePasswordBodyParams = z.object({
    current_password: z.string(),
    new_password: z.string().min(6),
  })

  const { current_password, new_password } = updatePasswordBodyParams.parse(
    request.body,
  )

  const id = (request.user as { sub: string }).sub

  try {
    const usersRepository = new PrismaUsersRepository()
    const updatePasswordUseCase = new UpdatePasswordUseCase(usersRepository)

    await updatePasswordUseCase.execute({ id, current_password, new_password })
    return reply.status(200).send({ msg: 'OK!' })
  } catch (err) {
    if (err instanceof UserNotExistsError) {
      return reply.status(404).send({ msg: err.message })
    }
    if (err instanceof InvalidCredentials) {
      return reply.status(400).send({ msg: err.message })
    }
    throw err
  }
}
