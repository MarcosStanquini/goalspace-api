import { UsersRepository } from '../repositories/users-repository'
import { toUserProfile } from './utils/to-user-profile'

export class GetAllUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute() {
    const users = await this.usersRepository.getAll()

    return users.map(toUserProfile)
  }
}
