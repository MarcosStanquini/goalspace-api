import { env } from '@/env'
import { UsersRepository } from '../users/repositories/users-repository'

export async function conecctionStatus(
  user_id: string,
  usersRepository: UsersRepository,
) {
  const user = await usersRepository.findById(user_id)

  const instanceName = user?.instanceName

  const response = await fetch(
    `http://localhost:8080/instance/connectionState/${instanceName}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.EVOLUTION_API_KEY,
      },
    },
  )

  const data = await response.json()
  return {
    data,
  }
}
