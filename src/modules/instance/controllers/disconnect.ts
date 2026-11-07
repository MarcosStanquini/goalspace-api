import { FastifyReply, FastifyRequest } from 'fastify'
import { makeDisconnectInstanceUseCase } from '../use-cases/factories'
import { handleInstanceError } from './handle-instance-error'

export async function disconnectInstance(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const disconnectInstanceUseCase = makeDisconnectInstanceUseCase()
    await disconnectInstanceUseCase.execute({ user_id: request.user.sub })

    return reply.status(204).send()
  } catch (err) {
    return handleInstanceError(err, reply)
  }
}
