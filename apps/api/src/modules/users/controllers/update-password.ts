import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { makeUpdatePasswordUseCase } from '../use-cases/factories'
import { UserNotExistsError } from '../use-cases/errors/user-not-found-error'
import { InvalidCredentials } from '@/modules/auth/use-cases/errors/invalid-credentials'

export async function updatePassword(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updatePasswordBodyParams = z.object({
    current_password: z.string(),
    new_password: z.string().min(6),
  })

  const { current_password, new_password } = updatePasswordBodyParams.parse(
    request.body,
  )

  try {
    const updatePasswordUseCase = makeUpdatePasswordUseCase()

    await updatePasswordUseCase.execute({
      id: request.user.sub,
      current_password,
      new_password,
    })
    return reply.status(204).send()
  } catch (err) {
    if (err instanceof UserNotExistsError) {
      return reply.status(404).send({ message: err.message })
    }
    if (err instanceof InvalidCredentials) {
      return reply.status(400).send({ message: err.message })
    }
    throw err
  }
}
