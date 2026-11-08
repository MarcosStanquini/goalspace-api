import { UsersRepository } from '@/modules/users/repositories/users-repository'
import { WhatsappProvider } from '../providers/whatsapp-provider'
import { InstanceNotConnected } from './errors/instance-not-connected'
import { InstanceNotFound } from './errors/instance-not-found'

interface SendMessageUseCaseRequest {
  user_id: string
  message: string
}

// Envia uma mensagem para o próprio WhatsApp conectado pelo usuário
export class SendMessageUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private whatsappProvider: WhatsappProvider,
  ) {}

  async execute({ user_id, message }: SendMessageUseCaseRequest) {
    const user = await this.usersRepository.findById(user_id)

    if (!user?.instanceName) {
      throw new InstanceNotFound()
    }

    let ownerNumber = user.ownerNumber

    if (!ownerNumber) {
      ownerNumber = await this.whatsappProvider.getOwnerNumber(
        user.instanceName,
      )

      if (!ownerNumber) {
        throw new InstanceNotConnected()
      }

      await this.usersRepository.updateOwnerNumber(user_id, ownerNumber)
    }

    await this.whatsappProvider.sendText(
      user.instanceName,
      ownerNumber,
      message,
    )
  }
}
