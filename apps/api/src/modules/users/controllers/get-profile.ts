import { FastifyReply, FastifyRequest } from 'fastify'
import { makeGetProfileUseCase } from '../use-cases/factories'
import { UserNotExistsError } from '../use-cases/errors/user-not-found-error'

export async function getProfile(request: FastifyRequest, reply: FastifyReply) {
  try {
    const getProfileUseCase = makeGetProfileUseCase()
    const user = await getProfileUseCase.execute({ id: request.user.sub })

    return reply.status(200).send(user)
  } catch (err) {
    if (err instanceof UserNotExistsError) {
      return reply.status(404).send({ message: err.message })
    }
    throw err
  }
}
