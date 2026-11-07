import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { makeUpdateNotificationSettingsUseCase } from '../use-cases/factories'

export async function updateSettings(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updateNotificationSettingsBody = z.object({
    remindBefore24h: z.boolean().optional(),
    remindBefore1h: z.boolean().optional(),
    onGoalCompleted: z.boolean().optional(),
    weeklyReport: z.boolean().optional(),
    achievementAlert: z.boolean().optional(),
  })

  const settings = updateNotificationSettingsBody.parse(request.body)

  const updateNotificationSettingsUseCase =
    makeUpdateNotificationSettingsUseCase()
  const notificationSettings = await updateNotificationSettingsUseCase.execute({
    user_id: request.user.sub,
    ...settings,
  })

  return reply.status(200).send(notificationSettings)
}
