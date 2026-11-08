import { Prisma, User } from '@prisma/client'

export interface UserUpdateInput {
  name?: string
  email?: string
}

export interface UsersRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: Prisma.UserCreateInput): Promise<User>
  getAll(): Promise<User[]>
  update(id: string, data: UserUpdateInput): Promise<User>
  updateInstance(id: string, instanceName: string | null): Promise<boolean>
  updateOwnerNumber(id: string, ownerNumber: string | null): Promise<boolean>
  updatePassword(id: string, password_hash: string): Promise<boolean>
}
