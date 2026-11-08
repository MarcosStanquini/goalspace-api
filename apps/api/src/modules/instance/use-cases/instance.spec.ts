import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUsersRepository } from '@/modules/users/repositories/in-memory/in-memory-users-repository'
import { InMemoryWhatsappProvider } from '../providers/in-memory/in-memory-whatsapp-provider'
import { CreateInstanceUseCase } from './create'
import { HandleWhatsappConnectionUseCase } from './handle-whatsapp-connection'
import { GetInstanceStatusUseCase } from './get-status'
import { SendMessageUseCase } from './send-message'
import { DisconnectInstanceUseCase } from './disconnect'
import { InstanceNotConnected } from './errors/instance-not-connected'
import { InstanceNotFound } from './errors/instance-not-found'

let usersRepository: InMemoryUsersRepository
let whatsappProvider: InMemoryWhatsappProvider
let userId: string

describe('WhatsApp instance flow', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository()
    whatsappProvider = new InMemoryWhatsappProvider()

    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: 'x',
    })
    userId = user.id
  })

  it('goes from QR Code to sending a message', async () => {
    const connect = new HandleWhatsappConnectionUseCase(
      usersRepository,
      whatsappProvider,
      new CreateInstanceUseCase(usersRepository, whatsappProvider),
    )
    const status = new GetInstanceStatusUseCase(
      usersRepository,
      whatsappProvider,
    )
    const send = new SendMessageUseCase(usersRepository, whatsappProvider)

    // Usuário novo: cria a instância e recebe o QR Code
    const { instanceName, qrCode } = await connect.execute({ user_id: userId })
    expect(qrCode).toEqual(expect.any(String))
    await expect(status.execute({ user_id: userId })).resolves.toMatchObject({
      connected: false,
      state: 'connecting',
    })

    // Antes de ler o QR Code não há número para enviar
    await expect(
      send.execute({ user_id: userId, message: 'hi' }),
    ).rejects.toBeInstanceOf(InstanceNotConnected)

    whatsappProvider.simulateScan(instanceName, '5511999999999@s.whatsapp.net')

    await expect(status.execute({ user_id: userId })).resolves.toMatchObject({
      connected: true,
      ownerNumber: '5511999999999@s.whatsapp.net',
    })

    await send.execute({ user_id: userId, message: 'hi' })
    expect(whatsappProvider.sentMessages).toEqual([
      { instanceName, number: '5511999999999@s.whatsapp.net', text: 'hi' },
    ])
  })

  it('reports not_created for users that never connected', async () => {
    const status = new GetInstanceStatusUseCase(
      usersRepository,
      whatsappProvider,
    )

    await expect(status.execute({ user_id: userId })).resolves.toMatchObject({
      state: 'not_created',
      connected: false,
    })
  })

  it('clears the owner number on logout', async () => {
    const instanceName = 'goalspace_test'
    await whatsappProvider.createInstance(instanceName)
    await usersRepository.updateInstance(userId, instanceName)
    await usersRepository.updateOwnerNumber(userId, '5511')

    const disconnect = new DisconnectInstanceUseCase(
      usersRepository,
      whatsappProvider,
    )
    await disconnect.execute({ user_id: userId })

    expect(usersRepository.items[0].ownerNumber).toBeNull()
  })

  it('fails to logout without an instance', async () => {
    const disconnect = new DisconnectInstanceUseCase(
      usersRepository,
      whatsappProvider,
    )

    await expect(
      disconnect.execute({ user_id: userId }),
    ).rejects.toBeInstanceOf(InstanceNotFound)
  })
})
