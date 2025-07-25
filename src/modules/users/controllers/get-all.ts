import { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaUsersRepository } from '../repositories/prisma/prisma-users-repository'
import { GetAllUseCase } from '../use-cases/get-all'
import { UserNotExistsError } from '../use-cases/errors/user-not-found-error'

export async function getAll(request: FastifyRequest, reply: FastifyReply) {
  let users
  try {
    const prismaUserRepository = new PrismaUsersRepository()
    const getAllUseCase = new GetAllUseCase(prismaUserRepository)

    users = await getAllUseCase.execute()
  } catch (err) {
    if (err instanceof UserNotExistsError) {
      return reply.status(404).send({ message: err.message })
    }
    throw err
  }
  return reply.status(200).send(users)
}
