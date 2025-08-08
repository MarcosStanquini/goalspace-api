import { GoalsRepository } from '@/modules/goals/repositories/goals-repository'
import { UsersRepository } from '@/modules/users/repositories/users-repository'
import { NotificationSettingsRepository } from '../../repositories/notification-repository'
import { UserNotExistsError } from '@/modules/users/use-cases/errors/user-not-found-error'
import { GoalNotFound } from '@/modules/goals/use-cases/errors/goal-not-found'
import { generateAchievementMessage } from './templates/achievement-alert'

interface Reminder {
  userId: string
  message: string
}

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

    const goals = await this.goalsRepository.findManyByUserId(userId)

    if (!goals || goals.length === 0) {
      throw new GoalNotFound()
    }

    const notificationSettings =
      await this.notificationSettingsRepository.findByUserId(userId)

    if (!notificationSettings?.achievementAlert) {
      console.log('Achievement Alert - Disabled')
      return []
    }

    const completedGoals = goals.filter((goal) => goal.isCompleted === true)
    const completedCount = completedGoals.length

    const message = generateAchievementMessage({
      userName: user.name,
      completedCount,
    })

    return [{ userId, message }]
  }
}
