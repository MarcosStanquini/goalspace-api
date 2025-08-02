import { NotificationSettingsRepository } from '../repositories/notification-repository'
import { CreateNotificationSettingsUseCase } from './create'

interface UpdateNotificationSettingsUseCaseRequest {
  user_id: string
  remindBefore24h?: boolean
  remindBefore1h?: boolean
  onGoalCompleted?: boolean
  weeklyReport?: boolean
  achievementAlert?: boolean
}

export class UpdateNotificationSettingsUseCase {
  constructor(
    private notificationSettingsRepository: NotificationSettingsRepository,
    private createNotificationSettingsUseCase: CreateNotificationSettingsUseCase,
  ) {}

  async execute({
    user_id,
    remindBefore24h,
    remindBefore1h,
    onGoalCompleted,
    weeklyReport,
    achievementAlert,
  }: UpdateNotificationSettingsUseCaseRequest) {
    const hasNotificationSettings =
      await this.notificationSettingsRepository.findByUserId(user_id)

    if (!hasNotificationSettings) {
      const notificationSettings =
        await this.createNotificationSettingsUseCase.execute({
          user_id,
          remindBefore24h,
          remindBefore1h,
          onGoalCompleted,
          weeklyReport,
          achievementAlert,
        })

      return notificationSettings
    } else {
      const notificationSettings =
        await this.notificationSettingsRepository.update(user_id, {
          remindBefore24h,
          remindBefore1h,
          onGoalCompleted,
          weeklyReport,
          achievementAlert,
        })
      return notificationSettings
    }
  }
}
