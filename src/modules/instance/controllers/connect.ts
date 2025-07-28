import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { ConnectInstanceUseCase } from '../use-cases/connect'
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma/prisma-users-repository'

export async function connectInstance(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { instanceName } = z
    .object({
      instanceName: z.string(),
    })
    .parse(request.params)

  const user_id = (request.user as { sub: string }).sub

  try {
    const usersRepository = new PrismaUsersRepository()
    const connectInstanceUseCase = new ConnectInstanceUseCase(usersRepository)
    const base64 = await connectInstanceUseCase.execute({
      instanceName,
      user_id,
    })

    return reply.status(200).send({ base64 })
  } catch (err) {
    return reply.status(400).send({
      message: 'Failed to connect to Instance',
    })
  }
}
