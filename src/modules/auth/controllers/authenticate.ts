import { FastifyRequest, FastifyReply } from 'fastify'
import z from 'zod'

import { PrismaUsersRepository } from '@/modules/users/repositories/prisma/prisma-users-repository'
import { AuthenticateUseCase } from '../use-cases/authenticate'
import { InvalidCredentials } from '../use-cases/errors/invalid-credentials'

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authenticateBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })

  const { email, password } = authenticateBodySchema.parse(request.body)

  try {
    const prismaUsersRepository = new PrismaUsersRepository()
    const authenticateUseCase = new AuthenticateUseCase(prismaUsersRepository)
    const { user } = await authenticateUseCase.execute({
      email,
      password,
    })
    const token = await reply.jwtSign(
      {
        name: user.name,
        role: user.role,
      },
      {
        sign: {
          sub: user.id,
          expiresIn: '7d',
        },
      },
    )
    return reply.status(200).send({ token })
  } catch (err) {
    if (err instanceof InvalidCredentials) {
      return reply.status(401).send({ message: err.message })
    }
    throw err
  }
}
