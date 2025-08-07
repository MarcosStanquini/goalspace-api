import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { PrismaNotificationRepository } from '../repositories/prisma/prisma-notification-repository'
import { CreateNotificationSettingsUseCase } from '../use-cases/create'
import { UpdateNotificationSettingsUseCase } from '../use-cases/update-settings'
import { NotificationSettingExists } from '../use-cases/errors/notification-settings-exists'

export async function updateSettings(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createNotificationSettingsBody = z.object({
    remindBefore24h: z.boolean().optional(),
    remindBefore1h: z.boolean().optional(),
    onGoalCompleted: z.boolean().optional(),
    weeklyReport: z.boolean().optional(),
    achievementAlert: z.boolean().optional(),
  })

  const {
    remindBefore24h,
    remindBefore1h,
    onGoalCompleted,
    weeklyReport,
    achievementAlert,
  } = createNotificationSettingsBody.parse(request.body)

  const user_id = (request.user as { sub: string }).sub

  try {
    const notificationSettingsRepository = new PrismaNotificationRepository()
    const createNotificationSettingsUseCase =
      new CreateNotificationSettingsUseCase(notificationSettingsRepository)
    const updateNotificationSettingsUseCase =
      new UpdateNotificationSettingsUseCase(
        notificationSettingsRepository,
        createNotificationSettingsUseCase,
      )

    const updatedNotificationSettings =
      await updateNotificationSettingsUseCase.execute({
        user_id,
        remindBefore24h,
        remindBefore1h,
        onGoalCompleted,
        weeklyReport,
        achievementAlert,
      })

    return reply.status(200).send(updatedNotificationSettings)
  } catch (err) {
    if (err instanceof NotificationSettingExists) {
      return reply.status(409).send({ message: err.message })
    }
    throw err
  }
}
