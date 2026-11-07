import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUsersRepository } from '../repositories/in-memory/in-memory-users-repository'
import { RegisterUseCase } from './register'
import { UpdateUserUseCase } from './update'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'

let usersRepository: InMemoryUsersRepository

describe('Users use cases', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
  })

  it('registers without exposing the password hash', async () => {
    const sut = new RegisterUseCase(usersRepository)

    const user = await sut.execute({
      name: 'John',
      email: 'john@example.com',
      password: '123456',
    })

    expect(user).not.toHaveProperty('password_hash')
    expect(usersRepository.items[0].password_hash).not.toBe('123456')
  })

  it('blocks changing the e-mail to one already in use', async () => {
    const register = new RegisterUseCase(usersRepository)
    const john = await register.execute({
      name: 'John',
      email: 'john@example.com',
      password: '123456',
    })
    await register.execute({
      name: 'Jane',
      email: 'jane@example.com',
      password: '123456',
    })

    const sut = new UpdateUserUseCase(usersRepository)

    await expect(
      sut.execute({ id: john.id, email: 'jane@example.com' }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)

    // Manter o próprio e-mail não é conflito
    await expect(
      sut.execute({ id: john.id, email: 'john@example.com', name: 'Johnny' }),
    ).resolves.toMatchObject({ name: 'Johnny' })
  })
})
