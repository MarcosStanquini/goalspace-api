import { prisma } from '@/lib/prisma'
import {
  NotificationSettingsInput,
  NotificationSettingsRepository,
} from '../notification-repository'

export class PrismaNotificationRepository implements NotificationSettingsRepository {
  async findByUserId(user_id: string) {
    const notificationSettings = await prisma.notificationSettings.findUnique({
      where: { user_id },
    })
    return notificationSettings
  }

  async upsert(user_id: string, data: NotificationSettingsInput) {
    const notificationSettings = await prisma.notificationSettings.upsert({
      where: { user_id },
      create: { user_id, ...data },
      update: data,
    })
    return notificationSettings
  }
}
