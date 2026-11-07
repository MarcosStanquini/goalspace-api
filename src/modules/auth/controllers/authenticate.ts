import { FastifyRequest, FastifyReply } from 'fastify'
import z from 'zod'

import { makeAuthenticateUseCase } from '../use-cases/factories'
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
    const authenticateUseCase = makeAuthenticateUseCase()
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
