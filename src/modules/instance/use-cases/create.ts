import { UsersRepository } from '@/modules/users/repositories/users-repository'
import { UserNotExistsError } from '@/modules/users/use-cases/errors/user-not-found-error'
import { WhatsappProvider } from '../providers/whatsapp-provider'
import { InstanceAlreadyExists } from './errors/instance-already-exists'

interface CreateInstanceUseCaseRequest {
  user_id: string
}

export class CreateInstanceUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private whatsappProvider: WhatsappProvider,
  ) {}

  async execute({ user_id }: CreateInstanceUseCaseRequest) {
    const user = await this.usersRepository.findById(user_id)

    if (!user) {
      throw new UserNotExistsError()
    }

    if (user.instanceName) {
      throw new InstanceAlreadyExists()
    }

    // Baseado no id: único, estável e sem caracteres especiais (nome/e-mail podem mudar)
    const instanceName = `goalspace_${user.id}`

    // Cria primeiro no provedor; só salva no usuário se deu certo
    await this.whatsappProvider.createInstance(instanceName)
    await this.usersRepository.updateInstance(user_id, instanceName)

    return { instanceName }
  }
}
