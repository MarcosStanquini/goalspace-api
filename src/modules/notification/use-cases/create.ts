import { NotificationSettingsRepository } from '../repositories/notification-repository'
import { NotificationSettingExists } from './errors/notification-settings-exists'

interface CreateNotificationSettingsUseCaseRequest {
  user_id: string
  remindBefore24h?: boolean
  remindBefore1h?: boolean
  onGoalCompleted?: boolean
  weeklyReport?: boolean
  achievementAlert?: boolean
}

export class CreateNotificationSettingsUseCase {
  constructor(
    private notificationSettingsRepository: NotificationSettingsRepository,
  ) {}

  async execute({
    user_id,
    remindBefore24h,
    remindBefore1h,
    onGoalCompleted,
    weeklyReport,
    achievementAlert,
  }: CreateNotificationSettingsUseCaseRequest) {
    const hasNotificationSettings =
      await this.notificationSettingsRepository.findByUserId(user_id)

    if (hasNotificationSettings) {
      throw new NotificationSettingExists()
    }

    const notification = await this.notificationSettingsRepository.create({
      user_id,
      remindBefore1h,
      remindBefore24h,
      onGoalCompleted,
      weeklyReport,
      achievementAlert,
    })

    return notification
  }
}
