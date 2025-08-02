import { NotificationSettings } from '@prisma/client'

export interface UpdateNotificationSettingsInput {
  remindBefore24h?: boolean
  remindBefore1h?: boolean
  onGoalCompleted?: boolean
  weeklyReport?: boolean
  achievementAlert?: boolean
}

export interface CreateNotificationSettingsInput {
  user_id: string
  remindBefore24h?: boolean
  remindBefore1h?: boolean
  onGoalCompleted?: boolean
  weeklyReport?: boolean
  achievementAlert?: boolean
}

export interface NotificationSettingsRepository {
  update(
    user_id: string,
    data: UpdateNotificationSettingsInput,
  ): Promise<NotificationSettings | null>
  create(data: CreateNotificationSettingsInput): Promise<NotificationSettings>
  findByUserId(user_id: string): Promise<NotificationSettings | null>
}
