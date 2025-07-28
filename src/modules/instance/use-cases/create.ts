import { env } from '@/env'
import { UsersRepository } from '@/modules/users/repositories/users-repository'
import { UserNotExistsError } from '@/modules/users/use-cases/errors/user-not-found-error'
import { InstanceAlreadyExists } from './errors/instance-already-exists'

interface CreateInstanceUseCaseRequest {
  user_id: string
}

export class CreateInstanceUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ user_id }: CreateInstanceUseCaseRequest) {
    const user = await this.usersRepository.findById(user_id)

    if (!user) {
      throw new UserNotExistsError()
    }

    if (user.instanceName) {
      throw new InstanceAlreadyExists()
    }

    const instanceName = `${user.name}_${user.email}`
      .replace(/\s+/g, '_')
      .toLowerCase()

    await this.usersRepository.updateInstance(user_id, instanceName)

    const response = await fetch('http://localhost:8080/instance/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.EVOLUTION_API_KEY,
      },
      body: JSON.stringify({ instanceName }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(
        `Failed to create instance. Status: ${response.status}. Body: ${errorBody}`,
      )
    }
    return {
      instanceName,
    }
  }
}
