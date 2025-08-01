import { env } from '@/env'
import { UsersRepository } from '@/modules/users/repositories/users-repository'

interface SendMessageUseCaseRequest {
  user_id: string
}

export class SendMessageUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ user_id }: SendMessageUseCaseRequest) {
    const user = await this.usersRepository.findById(user_id)

    const instanceName = user?.instanceName
    const ownerNumber = user?.ownerNumber

    const response = await fetch(
      `http://localhost:8080/message/send/${instanceName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: env.EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          number: ownerNumber,
          textMessage: {
            text: 'Teste!',
          },
        }),
      },
    )
    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(
        `Failed to send message. Status: ${response.status}. Body: ${errorBody}`,
      )
    }
    const responseData = await response.json()

    const messageSend = responseData.message.extendedTextMessage.text
    return messageSend
  }
}
