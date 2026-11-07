import { UsersRepository } from '../repositories/users-repository'
import { UserNotExistsError } from './errors/user-not-found-error'
import { toUserProfile } from './utils/to-user-profile'

interface GetProfileUseCaseRequest {
  id: string
}

export class GetProfileUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ id }: GetProfileUseCaseRequest) {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      throw new UserNotExistsError()
    }

    return toUserProfile(user)
  }
}
