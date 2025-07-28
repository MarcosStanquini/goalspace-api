import { env } from '@/env'
import { UsersRepository } from '@/modules/users/repositories/users-repository'
import { InstanceNotFound } from './errors/instance-not-found'

interface ConnectInstanceUseCaseRequest {
  instanceName: string
  user_id: string
}

export class ConnectInstanceUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ instanceName, user_id }: ConnectInstanceUseCaseRequest) {
    const user = await this.usersRepository.findById(user_id)

    if (!user?.instanceName) {
      throw new InstanceNotFound()
    }

    const response = await fetch(
      `http://localhost:8080/instance/connect/${instanceName}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          apikey: env.EVOLUTION_API_KEY,
        },
      },
    )

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(
        `Failed to connect instance. Status: ${response.status}. Body: ${errorBody}`,
      )
    }

    const responseData = await response.json()

    const base64QrCode = responseData.base64
    return base64QrCode
  }
}
