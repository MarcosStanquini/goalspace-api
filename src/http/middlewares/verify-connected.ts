import { env } from '@/env'
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma/prisma-users-repository'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyConnected(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const user_id = (request.user as { sub: string }).sub
  const usersRepository = new PrismaUsersRepository()
  const user = await usersRepository.findById(user_id)

  if (!user?.instanceName) {
    return reply
      .status(404)
      .send({ message: 'Instance not configured for this user.' })
  }

  const response = await fetch(
    `http://localhost:8080/instance/connectionState/${user.instanceName}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.EVOLUTION_API_KEY,
      },
    },
  )

  if (!response.ok) {
    return reply
      .status(500)
      .send({ message: 'Failed to check instance status.' })
  }

  const responseData = await response.json()
  const instanceState = responseData.instance?.state

  if (instanceState !== 'open') {
    return reply.status(403).send({
      message: `Instance is not connected (current state: ${instanceState}).`,
    })
  }
}
