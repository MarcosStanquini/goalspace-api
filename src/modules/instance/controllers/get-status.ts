import { FastifyRequest, FastifyReply } from 'fastify'
import { makeGetInstanceStatusUseCase } from '../use-cases/factories'
import { handleInstanceError } from './handle-instance-error'

export async function getStatus(request: FastifyRequest, reply: FastifyReply) {
  try {
    const getInstanceStatusUseCase = makeGetInstanceStatusUseCase()
    const status = await getInstanceStatusUseCase.execute({
      user_id: request.user.sub,
    })

    return reply.status(200).send(status)
  } catch (err) {
    return handleInstanceError(err, reply)
  }
}
