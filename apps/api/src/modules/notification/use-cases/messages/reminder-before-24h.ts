import { UsersRepository } from '@/modules/users/repositories/users-repository'
import { NotificationSettingsRepository } from '../../repositories/notification-repository'
import { UserNotExistsError } from '@/modules/users/use-cases/errors/user-not-found-error'
import { GoalsRepository } from '@/modules/goals/repositories/goals-repository'
import { generateReminder24hMessageForGoals } from './templates/reminder-before-24h'
import { filterUpcomingGoals } from './upcoming-goals'
import { Reminder } from './types'

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000

export class ReminderBefore24hUseCase {
  constructor(
    private notificationSettingsRepository: NotificationSettingsRepository,
    private usersRepository: UsersRepository,
    private goalsRepository: GoalsRepository,
  ) {}

  async execute(userId: string): Promise<Reminder[]> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new UserNotExistsError()
    }

    const settings =
      await this.notificationSettingsRepository.findByUserId(userId)

    if (!settings?.remindBefore24h) {
      return []
    }

    const goals = await this.goalsRepository.findManyByUserId(userId)
    const upcomingGoals = filterUpcomingGoals(goals, ONE_DAY_IN_MS)

    if (upcomingGoals.length === 0) {
      return []
    }

    const message = generateReminder24hMessageForGoals({
      userName: user.name,
      goals: upcomingGoals,
    })

    return [{ userId, message }]
  }
}
