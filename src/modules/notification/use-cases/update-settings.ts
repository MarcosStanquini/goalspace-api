import { NotificationSettingsRepository } from '../repositories/notification-repository'
import { toNotificationSettingsResponse } from './utils/to-notification-settings-response'

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
  ) {}

  async execute({
    user_id,
    ...data
  }: UpdateNotificationSettingsUseCaseRequest) {
    const notificationSettings =
      await this.notificationSettingsRepository.upsert(user_id, data)

    return toNotificationSettingsResponse(notificationSettings)
  }
}
