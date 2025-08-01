import { PrismaUsersRepository } from '@/modules/users/repositories/prisma/prisma-users-repository'
import { FastifyReply, FastifyRequest } from 'fastify'
import { SendMessageUseCase } from '../use-cases/send-message'

export async function sendMessage(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const user_id = (request.user as { sub: string }).sub

  try {
    const usersRepository = new PrismaUsersRepository()
    const sendMessageUseCase = new SendMessageUseCase(usersRepository)

    const messageSend = await sendMessageUseCase.execute({ user_id })
    return reply.status(200).send({ messageSend })
  } catch (err) {
    console.log(err)
    return reply.status(500).send({ message: 'Error to send message ' })
  }
}
