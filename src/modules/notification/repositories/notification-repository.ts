import { NotificationSettings } from '@prisma/client'

export interface NotificationSettingsInput {
  remindBefore24h?: boolean
  remindBefore1h?: boolean
  onGoalCompleted?: boolean
  weeklyReport?: boolean
  achievementAlert?: boolean
}

export interface NotificationSettingsRepository {
  findByUserId(user_id: string): Promise<NotificationSettings | null>
  // Cria as configurações na primeira vez e atualiza nas próximas
  upsert(
    user_id: string,
    data: NotificationSettingsInput,
  ): Promise<NotificationSettings>
}
