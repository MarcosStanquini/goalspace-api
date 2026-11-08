import { UsersRepository } from '@/modules/users/repositories/users-repository'
import { UserNotExistsError } from '@/modules/users/use-cases/errors/user-not-found-error'
import { WhatsappProvider } from '../providers/whatsapp-provider'

interface GetInstanceStatusUseCaseRequest {
  user_id: string
}

// Usado pelo front para acompanhar (polling) se o QR Code já foi lido
export class GetInstanceStatusUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private whatsappProvider: WhatsappProvider,
  ) {}

  async execute({ user_id }: GetInstanceStatusUseCaseRequest) {
    const user = await this.usersRepository.findById(user_id)

    if (!user) {
      throw new UserNotExistsError()
    }

    if (!user.instanceName) {
      return {
        instanceName: null,
        state: 'not_created' as const,
        connected: false,
        ownerNumber: null,
      }
    }

    const state = await this.whatsappProvider.getConnectionState(
      user.instanceName,
    )
    let ownerNumber = user.ownerNumber

    // Assim que conectar, guarda o número para os envios das notificações
    if (state === 'open' && !ownerNumber) {
      ownerNumber = await this.whatsappProvider.getOwnerNumber(
        user.instanceName,
      )
      if (ownerNumber) {
        await this.usersRepository.updateOwnerNumber(user_id, ownerNumber)
      }
    }

    return {
      instanceName: user.instanceName,
      state,
      connected: state === 'open',
      ownerNumber,
    }
  }
}
