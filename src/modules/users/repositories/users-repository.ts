import { Prisma, User } from '@prisma/client'

export interface UsersRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: Prisma.UserCreateInput): Promise<User>
  getAll(): Promise<User[]>
  update(id: string, name?: string, email?: string): Promise<User>
  updateInstance(id: string, instanceName: string): Promise<boolean>
  updateOwnerNumber(id: string, ownerNumber: string): Promise<boolean>
}
