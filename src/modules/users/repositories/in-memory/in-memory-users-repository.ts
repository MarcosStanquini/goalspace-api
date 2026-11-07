import { randomUUID } from 'node:crypto'
import { Prisma, User } from '@prisma/client'
import { UsersRepository, UserUpdateInput } from '../users-repository'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []

  async findById(id: string) {
    return this.items.find((item) => item.id === id) ?? null
  }

  async findByEmail(email: string) {
    return this.items.find((item) => item.email === email) ?? null
  }

  async create(data: Prisma.UserCreateInput) {
    const user: User = {
      id: data.id ?? randomUUID(),
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      role: data.role ?? 'USER',
      instanceName: data.instanceName ?? null,
      ownerNumber: data.ownerNumber ?? null,
    }
    this.items.push(user)
    return user
  }

  async getAll() {
    return this.items
  }

  async update(id: string, data: UserUpdateInput) {
    const user = this.items.find((item) => item.id === id)!
    Object.assign(user, {
      name: data.name ?? user.name,
      email: data.email ?? user.email,
    })
    return user
  }

  async updateInstance(id: string, instanceName: string | null) {
    const user = this.items.find((item) => item.id === id)!
    user.instanceName = instanceName
    return true
  }

  async updateOwnerNumber(id: string, ownerNumber: string | null) {
    const user = this.items.find((item) => item.id === id)!
    user.ownerNumber = ownerNumber
    return true
  }

  async updatePassword(id: string, password_hash: string) {
    const user = this.items.find((item) => item.id === id)!
    user.password_hash = password_hash
    return true
  }
}
