import { NotificationSettingsRepository } from '../repositories/notification-repository'
import { toNotificationSettingsResponse } from './utils/to-notification-settings-response'

interface GetNotificationSettingsUseCaseRequest {
  user_id: string
}

export class GetNotificationSettingsUseCase {
  constructor(
    private notificationSettingsRepository: NotificationSettingsRepository,
  ) {}

  async execute({ user_id }: GetNotificationSettingsUseCaseRequest) {
    const notificationSettings =
      await this.notificationSettingsRepository.findByUserId(user_id)

    // Usuário que nunca salvou configurações: tudo desligado (mesmo default do banco)
    return toNotificationSettingsResponse(notificationSettings)
  }
}
