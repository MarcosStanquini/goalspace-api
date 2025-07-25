import { UsersRepository } from '../repositories/users-repository'
import { UserNotExistsError } from './errors/user-not-found-error'

export class GetAllUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute() {
    const users = await this.usersRepository.getAll()

    if (!users || users.length === 0) {
      throw new UserNotExistsError()
    }
    const usersWithoutPassword = users
      ? users.map(({ name, email, role }) => ({
          name,
          email,
          role,
        }))
      : []

    return usersWithoutPassword
  }
}
