import { UsersRepository } from '@/modules/users/repositories/users-repository'
import { WhatsappProvider } from '../providers/whatsapp-provider'
import { InstanceNotFound } from './errors/instance-not-found'

interface DisconnectInstanceUseCaseRequest {
  user_id: string
}

export class DisconnectInstanceUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private whatsappProvider: WhatsappProvider,
  ) {}

  async execute({ user_id }: DisconnectInstanceUseCaseRequest) {
    const user = await this.usersRepository.findById(user_id)

    if (!user?.instanceName) {
      throw new InstanceNotFound()
    }

    await this.whatsappProvider.logout(user.instanceName)

    // Outro número pode ser conectado depois, então o atual é descartado
    await this.usersRepository.updateOwnerNumber(user_id, null)
  }
}
