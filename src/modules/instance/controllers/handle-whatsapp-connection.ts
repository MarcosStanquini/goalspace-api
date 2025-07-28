import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma/prisma-users-repository'
import { CreateInstanceUseCase } from '../use-cases/create'
import { ConnectInstanceUseCase } from '../use-cases/connect'
import { HandleWhatsappConnectionUseCase } from '../use-cases/handle-whatsapp-connection'

export async function whatsappConnect(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const user_id = (request.user as { sub: string }).sub
  try {
    const usersRepository = new PrismaUsersRepository()
    const createInstance = new CreateInstanceUseCase(usersRepository)
    const connectInstance = new ConnectInstanceUseCase(usersRepository)

    const useCase = new HandleWhatsappConnectionUseCase(
      connectInstance,
      createInstance,
      usersRepository,
    )

    const { instanceName, qrCode } = await useCase.execute({ user_id })

    return reply.status(200).send({ instanceName, qrCode })
  } catch (error) {
    return reply.status(500).send({ message: 'Erro ao conectar WhatsApp' })
  }
}
