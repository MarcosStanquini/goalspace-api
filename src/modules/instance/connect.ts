import { env } from '@/env'
import { UsersRepository } from '../users/repositories/users-repository'






export class ConnectInstanceUseCase{
  constructor(private usersRepository: UsersRepository)
}(
  user_id: string,
  usersRepository: UsersRepository,
) {
  const user = await usersRepository.findById(user_id)

  const instanceName = user?.instanceName

  const response = await fetch(
    `http://localhost:8080/instance/connect/${instanceName}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.EVOLUTION_API_KEY,
      },
    },
  )

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `Erro ao conectar a instância. Status: ${response.status}. Corpo: ${errorBody}`,
    )
  }

  const data = await response.json()
  return {
    data,
  }
}
