import { randomUUID } from 'node:crypto'
import { NotificationSettings } from '@prisma/client'
import {
  NotificationSettingsInput,
  NotificationSettingsRepository,
} from '../notification-repository'

export class InMemoryNotificationRepository implements NotificationSettingsRepository {
  public items: NotificationSettings[] = []

  async findByUserId(user_id: string) {
    return this.items.find((item) => item.user_id === user_id) ?? null
  }

  async upsert(user_id: string, data: NotificationSettingsInput) {
    let settings = this.items.find((item) => item.user_id === user_id)

    if (!settings) {
      settings = {
        id: randomUUID(),
        user_id,
        remindBefore24h: false,
        remindBefore1h: false,
        onGoalCompleted: false,
        weeklyReport: false,
        achievementAlert: false,
      }
      this.items.push(settings)
    }

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        Object.assign(settings, { [key]: value })
      }
    }

    return settings
  }
}
