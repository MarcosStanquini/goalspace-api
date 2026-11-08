import { PrismaUsersRepository } from '@/modules/users/repositories/prisma/prisma-users-repository'
import { EvolutionWhatsappProvider } from '../../providers/evolution/evolution-whatsapp-provider'
import { CreateInstanceUseCase } from '../create'
import { DisconnectInstanceUseCase } from '../disconnect'
import { GetInstanceStatusUseCase } from '../get-status'
import { HandleWhatsappConnectionUseCase } from '../handle-whatsapp-connection'
import { SendMessageUseCase } from '../send-message'

export function makeHandleWhatsappConnectionUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const whatsappProvider = new EvolutionWhatsappProvider()

  return new HandleWhatsappConnectionUseCase(
    usersRepository,
    whatsappProvider,
    new CreateInstanceUseCase(usersRepository, whatsappProvider),
  )
}

export function makeGetInstanceStatusUseCase() {
  return new GetInstanceStatusUseCase(
    new PrismaUsersRepository(),
    new EvolutionWhatsappProvider(),
  )
}

export function makeDisconnectInstanceUseCase() {
  return new DisconnectInstanceUseCase(
    new PrismaUsersRepository(),
    new EvolutionWhatsappProvider(),
  )
}

export function makeSendMessageUseCase() {
  return new SendMessageUseCase(
    new PrismaUsersRepository(),
    new EvolutionWhatsappProvider(),
  )
}
