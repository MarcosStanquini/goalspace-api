import { UsersRepository } from '../repositories/users-repository'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import { UserNotExistsError } from './errors/user-not-found-error'
import { toUserProfile } from './utils/to-user-profile'

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

    if (email && email !== user.email) {
      const userWithSameEmail = await this.usersRepository.findByEmail(email)

      if (userWithSameEmail) {
        throw new UserAlreadyExistsError()
      }
    }

    const updatedUser = await this.usersRepository.update(id, { name, email })

    return toUserProfile(updatedUser)
  }
}
