import { PrismaUsersRepository } from '@/modules/users/repositories/prisma/prisma-users-repository'
import { FastifyReply, FastifyRequest } from 'fastify'
import { DesconnectInstanceUseCase } from '../use-cases/desconnect'

export async function desconnectInstance(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const user_id = (request.user as { sub: string }).sub

  try {
    const usersRepository = new PrismaUsersRepository()
    const desconnectInstanceUseCase = new DesconnectInstanceUseCase(
      usersRepository,
    )

    await desconnectInstanceUseCase.execute({ user_id })
    return reply.status(200).send({ message: 'Sucesseful Desconnected!' })
  } catch (err) {
    return reply.status(400).send({ message: 'Bad Request' })
  }
}
