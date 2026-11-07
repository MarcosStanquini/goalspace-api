import { NotificationSettings } from '@prisma/client'

export function toNotificationSettingsResponse(
  settings: NotificationSettings | null,
) {
  return {
    remindBefore24h: settings?.remindBefore24h ?? false,
    remindBefore1h: settings?.remindBefore1h ?? false,
    onGoalCompleted: settings?.onGoalCompleted ?? false,
    weeklyReport: settings?.weeklyReport ?? false,
    achievementAlert: settings?.achievementAlert ?? false,
  }
}
