import { UsersRepository } from '@/modules/users/repositories/users-repository'
import { UserNotExistsError } from '@/modules/users/use-cases/errors/user-not-found-error'
import { WhatsappProvider } from '../providers/whatsapp-provider'
import { CreateInstanceUseCase } from './create'

interface HandleWhatsappConnectionUseCaseRequest {
  user_id: string
}

// Cria a instância (se ainda não existir) e devolve o QR Code para o usuário escanear
export class HandleWhatsappConnectionUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private whatsappProvider: WhatsappProvider,
    private createInstanceUseCase: CreateInstanceUseCase,
  ) {}

  async execute({ user_id }: HandleWhatsappConnectionUseCaseRequest) {
    const user = await this.usersRepository.findById(user_id)

    if (!user) {
      throw new UserNotExistsError()
    }

    let instanceName = user.instanceName

    if (!instanceName) {
      const created = await this.createInstanceUseCase.execute({ user_id })
      instanceName = created.instanceName
    }

    const { qrCode } = await this.whatsappProvider.connect(instanceName)

    return { instanceName, qrCode, connected: qrCode === null }
  }
}
