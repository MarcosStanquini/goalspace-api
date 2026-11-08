import { FastifyReply, FastifyRequest } from 'fastify'
import { makeGetNotificationSettingsUseCase } from '../use-cases/factories'

export async function getSettings(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const getNotificationSettingsUseCase = makeGetNotificationSettingsUseCase()
  const notificationSettings = await getNotificationSettingsUseCase.execute({
    user_id: request.user.sub,
  })

  return reply.status(200).send(notificationSettings)
}
