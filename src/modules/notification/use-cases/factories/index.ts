import { PrismaNotificationRepository } from '../../repositories/prisma/prisma-notification-repository'
import { GetNotificationSettingsUseCase } from '../get-settings'
import { UpdateNotificationSettingsUseCase } from '../update-settings'

export function makeGetNotificationSettingsUseCase() {
  return new GetNotificationSettingsUseCase(new PrismaNotificationRepository())
}

export function makeUpdateNotificationSettingsUseCase() {
  return new UpdateNotificationSettingsUseCase(
    new PrismaNotificationRepository(),
  )
}
