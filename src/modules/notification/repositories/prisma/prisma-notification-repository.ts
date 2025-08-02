import { prisma } from '@/lib/prisma'
import {
  CreateNotificationSettingsInput,
  NotificationSettingsRepository,
  UpdateNotificationSettingsInput,
} from '../notification-repository'
import { NotificationSettings } from '@prisma/client'

export class PrismaNotificationRepository
  implements NotificationSettingsRepository
{
  async create(
    data: CreateNotificationSettingsInput,
  ): Promise<NotificationSettings> {
    const notification = await prisma.notificationSettings.create({
      data: {
        user_id: data.user_id,
        remindBefore24h: data.remindBefore24h,
        remindBefore1h: data.remindBefore1h,
        onGoalCompleted: data.onGoalCompleted,
        weeklyReport: data.weeklyReport,
        achievementAlert: data.achievementAlert,
      },
    })

    return notification
  }

  async update(user_id: string, data: UpdateNotificationSettingsInput) {
    const notification = await prisma.notificationSettings.update({
      where: { user_id },
      data: {
        remindBefore24h: data.remindBefore24h,
        remindBefore1h: data.remindBefore1h,
        onGoalCompleted: data.onGoalCompleted,
        weeklyReport: data.weeklyReport,
        achievementAlert: data.achievementAlert,
      },
    })

    return notification
  }

  async findByUserId(user_id: string) {
    const notificationSettings = await prisma.notificationSettings.findUnique({
      where: { user_id },
    })
    return notificationSettings
  }
}
