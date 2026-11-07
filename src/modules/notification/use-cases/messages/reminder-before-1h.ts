import { UsersRepository } from '@/modules/users/repositories/users-repository'
import { NotificationSettingsRepository } from '../../repositories/notification-repository'
import { UserNotExistsError } from '@/modules/users/use-cases/errors/user-not-found-error'
import { GoalsRepository } from '@/modules/goals/repositories/goals-repository'
import { generateReminder1hMessageForGoals } from './templates/reminder-before-1h'
import { filterUpcomingGoals } from './upcoming-goals'
import { Reminder } from './types'

const ONE_HOUR_IN_MS = 60 * 60 * 1000

export class ReminderBefore1hUseCase {
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

    if (!settings?.remindBefore1h) {
      return []
    }

    const goals = await this.goalsRepository.findManyByUserId(userId)
    const upcomingGoals = filterUpcomingGoals(goals, ONE_HOUR_IN_MS)

    if (upcomingGoals.length === 0) {
      return []
    }

    const message = generateReminder1hMessageForGoals({
      userName: user.name,
      goals: upcomingGoals,
    })

    return [{ userId, message }]
  }
}
