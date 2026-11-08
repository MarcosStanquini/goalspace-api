import { PrismaUsersRepository } from '@/modules/users/repositories/prisma/prisma-users-repository'
import { AuthenticateUseCase } from '../authenticate'

export function makeAuthenticateUseCase() {
  const usersRepository = new PrismaUsersRepository()

  return new AuthenticateUseCase(usersRepository)
}
