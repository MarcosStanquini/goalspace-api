import { UsersRepository } from '@/modules/users/repositories/users-repository'
import { InstanceNotFound } from './errors/instance-not-found'
import { env } from '@/env'

interface DesconnectInstanceUseCaseRequest {
  user_id: string
}

export class DesconnectInstanceUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ user_id }: DesconnectInstanceUseCaseRequest) {
    const user = await this.usersRepository.findById(user_id)

    const instanceName = user?.instanceName

    if (!instanceName) {
      throw new InstanceNotFound()
    }

    const response = await fetch(
      `http://localhost:8080/instance/logout/${instanceName}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          apikey: env.EVOLUTION_API_KEY,
        },
      },
    )

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(
        `Failed to logout instance. Status: ${response.status}. Body: ${errorBody}`,
      )
    }
  }
}
