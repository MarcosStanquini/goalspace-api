import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeUpdateUserUseCase } from '../use-cases/factories'
import { UserNotExistsError } from '../use-cases/errors/user-not-found-error'
import { UserAlreadyExistsError } from '../use-cases/errors/user-already-exists-error'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateBodyParams = z.object({
    name: z.string().trim().min(1).optional(),
    email: z.string().email().optional(),
  })

  const { name, email } = updateBodyParams.parse(request.body)

  try {
    const updateUserUseCase = makeUpdateUserUseCase()
    const user = await updateUserUseCase.execute({
      id: request.user.sub,
      name,
      email,
    })

    return reply.status(200).send(user)
  } catch (err) {
    if (err instanceof UserNotExistsError) {
      return reply.status(404).send({ message: err.message })
    }
    if (err instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: err.message })
    }
    throw err
  }
}
