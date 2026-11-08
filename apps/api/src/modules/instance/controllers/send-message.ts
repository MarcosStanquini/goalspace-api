import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSendMessageUseCase } from '../use-cases/factories'
import { handleInstanceError } from './handle-instance-error'

export async function sendMessage(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sendMessageBodySchema = z.object({
    message: z.string().trim().min(1),
  })

  const { message } = sendMessageBodySchema.parse(request.body)

  try {
    const sendMessageUseCase = makeSendMessageUseCase()
    await sendMessageUseCase.execute({ user_id: request.user.sub, message })

    return reply.status(204).send()
  } catch (err) {
    return handleInstanceError(err, reply)
  }
}
