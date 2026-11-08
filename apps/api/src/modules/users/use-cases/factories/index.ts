import { PrismaUsersRepository } from '../../repositories/prisma/prisma-users-repository'
import { GetAllUseCase } from '../get-all'
import { GetProfileUseCase } from '../get-profile'
import { RegisterUseCase } from '../register'
import { UpdateUserUseCase } from '../update'
import { UpdatePasswordUseCase } from '../update-password'

export function makeRegisterUseCase() {
  return new RegisterUseCase(new PrismaUsersRepository())
}

export function makeGetAllUseCase() {
  return new GetAllUseCase(new PrismaUsersRepository())
}

export function makeGetProfileUseCase() {
  return new GetProfileUseCase(new PrismaUsersRepository())
}

export function makeUpdateUserUseCase() {
  return new UpdateUserUseCase(new PrismaUsersRepository())
}

export function makeUpdatePasswordUseCase() {
  return new UpdatePasswordUseCase(new PrismaUsersRepository())
}
