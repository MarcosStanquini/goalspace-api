import { FastifyRequest, FastifyReply } from 'fastify'
import { makeHandleWhatsappConnectionUseCase } from '../use-cases/factories'
import { handleInstanceError } from './handle-instance-error'

export async function whatsappConnect(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const handleWhatsappConnectionUseCase =
      makeHandleWhatsappConnectionUseCase()
    const result = await handleWhatsappConnectionUseCase.execute({
      user_id: request.user.sub,
    })

    return reply.status(200).send(result)
  } catch (err) {
    return handleInstanceError(err, reply)
  }
}
