import { env } from '@/env'
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma/prisma-users-repository'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyOwnerNumber(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const user_id = (request.user as { sub: string }).sub
  const usersRepository = new PrismaUsersRepository()

  const user = await usersRepository.findById(user_id)

  if (!user) {
    return reply.status(404).send({ message: 'Usuário não encontrado.' })
  }

  if (!user.ownerNumber) {
    try {
      const response = await fetch(
        `http://localhost:8080/instance/fetchInstances?instanceName=${user.instanceName}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            apikey: env.EVOLUTION_API_KEY,
          },
        },
      )

      if (!response.ok) {
        return reply.status(500).send({
          message: 'Erro ao buscar número do cliente na Evolution API.',
        })
      }

      const responseData = await response.json()
      const ownerNumber = responseData.instance.owner

      if (!ownerNumber) {
        return reply
          .status(400)
          .send({ message: 'Número do cliente não retornado pela API.' })
      }

      await usersRepository.updateOwnerNumber(user_id, ownerNumber)
    } catch (err) {
      return reply
        .status(500)
        .send({ message: 'Erro interno ao buscar número do cliente.' })
    }
  }
}
