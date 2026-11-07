import { FastifyRequest, FastifyReply } from 'fastify'
import z from 'zod'

import { UserAlreadyExistsError } from '@/modules/users/use-cases/errors/user-already-exists-error'
import { makeRegisterUseCase } from '../use-cases/factories'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    name: z.string().trim().min(1),
    email: z.string().email(),
    password: z.string().min(6),
  })

  const { name, email, password } = registerBodySchema.parse(request.body)

  try {
    const registerUseCase = makeRegisterUseCase()
    const user = await registerUseCase.execute({
      name,
      email,
      password,
    })

    return reply.status(201).send(user)
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: err.message })
    }
    throw err
  }
}
