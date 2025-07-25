import { PrismaUsersRepository } from '@/modules/users/repositories/prisma/prisma-users-repository'
import { FastifyReply, FastifyRequest } from 'fastify'
import { CreateInstanceUseCase } from '../use-cases/create'
import { UserNotExistsError } from '@/modules/users/use-cases/errors/user-not-found-error'
import { InstanceAlreadyExists } from '../use-cases/errors/instance-already-exists'

export async function createInstance(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const user_id = (request.user as { sub: string }).sub

  try {
    const usersRepository = new PrismaUsersRepository()
    const createInstanceUseCase = new CreateInstanceUseCase(usersRepository)

    const { instanceName } = await createInstanceUseCase.execute({ user_id })
    return reply.status(200).send({ instanceName })
  } catch (err) {
    if (err instanceof UserNotExistsError) {
      return reply.status(404).send({
        message: err.message,
      })
    }

    if (err instanceof InstanceAlreadyExists) {
      return reply.status(409).send({
        message: err.message,
      })
    }
    throw err
  }
}
