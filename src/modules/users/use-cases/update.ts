import { UsersRepository } from '../repositories/users-repository'
import { UserNotExistsError } from './errors/user-not-found-error'

interface UpdateUserUseCaseRequest {
  id: string
  name?: string
  email?: string
}

export class UpdateUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ id, name, email }: UpdateUserUseCaseRequest) {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      throw new UserNotExistsError()
    }

    const updatedUser = await this.usersRepository.update(id, name, email)

    return updatedUser
  }
}
