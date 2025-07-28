import { UsersRepository } from '@/modules/users/repositories/users-repository'
import { ConnectInstanceUseCase } from './connect'
import { CreateInstanceUseCase } from './create'

interface HandleWhatsappConnectionUseCaseRequest {
  user_id: string
}

export class HandleWhatsappConnectionUseCase {
  constructor(
    private connectInstanceUseCase: ConnectInstanceUseCase,
    private createInstanceUseCase: CreateInstanceUseCase,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ user_id }: HandleWhatsappConnectionUseCaseRequest) {
    const user = await this.usersRepository.findById(user_id)

    let instanceName = user?.instanceName

    if (!instanceName) {
      const { instanceName: name } = await this.createInstanceUseCase.execute({
        user_id,
      })
      instanceName = name
    }
    const qrCode = await this.connectInstanceUseCase.execute({
      instanceName,
      user_id,
    })

    return { instanceName, qrCode }
  }
}
