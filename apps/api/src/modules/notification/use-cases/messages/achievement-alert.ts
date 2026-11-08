import { GoalsRepository } from '@/modules/goals/repositories/goals-repository'
import { UsersRepository } from '@/modules/users/repositories/users-repository'
import { NotificationSettingsRepository } from '../../repositories/notification-repository'
import { UserNotExistsError } from '@/modules/users/use-cases/errors/user-not-found-error'
import { generateAchievementMessage } from './templates/achievement-alert'
import { Reminder } from './types'

export class AchievementAlertUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private goalsRepository: GoalsRepository,
    private notificationSettingsRepository: NotificationSettingsRepository,
  ) {}

  async execute(userId: string): Promise<Reminder[]> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new UserNotExistsError()
    }

    const notificationSettings =
      await this.notificationSettingsRepository.findByUserId(userId)

    if (!notificationSettings?.achievementAlert) {
      return []
    }

    const goals = await this.goalsRepository.findManyByUserId(userId)
    const completedCount = goals.filter((goal) => goal.isCompleted).length

    // Nada para comemorar ainda
    if (completedCount === 0) {
      return []
    }

    const message = generateAchievementMessage({
      userName: user.name,
      completedCount,
    })

    return [{ userId, message }]
  }
}
