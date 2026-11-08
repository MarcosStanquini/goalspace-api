import { InvalidCredentials } from '@/modules/auth/use-cases/errors/invalid-credentials'
import { UsersRepository } from '../repositories/users-repository'
import { UserNotExistsError } from './errors/user-not-found-error'
import { compare, hash } from 'bcryptjs'

interface UpdatePasswordUseCaseRequest {
  id: string
  current_password: string
  new_password: string
}

export class UpdatePasswordUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    id,
    current_password,
    new_password,
  }: UpdatePasswordUseCaseRequest) {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      throw new UserNotExistsError()
    }
    const doesPasswordMatches = await compare(
      current_password,
      user.password_hash,
    )

    if (!doesPasswordMatches) {
      throw new InvalidCredentials()
    }

    const password_hash = await hash(new_password, 6)

    await this.usersRepository.updatePassword(id, password_hash)
  }
}
