import { UsersRepository } from '@/modules/users/repositories/users-repository'
import { NotificationSettingsRepository } from '../repositories/notification-repository'
import { UserNotExistsError } from '@/modules/users/use-cases/errors/user-not-found-error'
import { GoalsRepository } from '@/modules/goals/repositories/goals-repository'
import { GoalNotFound } from '@/modules/goals/use-cases/errors/goal-not-found'
import { generateReminderMessageForGoals } from '../templates/reminder-before-24h'

interface Reminder {
  userId: string
  message: string
}

export class ReminderBefore24hUseCase {
  constructor(
    private notificationSettingsRepository: NotificationSettingsRepository,
    private usersRepository: UsersRepository,
    private goalsRepository: GoalsRepository,
  ) {}

  async execute(userId: string) {
    const user = await this.usersRepository.findById(userId)
    const reminders: Reminder[] = []

    if (!user) {
      throw new UserNotExistsError()
    }

    const settings =
      await this.notificationSettingsRepository.findByUserId(userId)

    if (!settings?.remindBefore24h) {
      return
    }

    const goals = await this.goalsRepository.findManyByUserId(userId)
    if (!goals || goals.length === 0) {
      throw new GoalNotFound()
    }

    const now = new Date()
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const upcomingGoals = goals.filter((goal) => {
      const goalDate = new Date(goal.deadline)
      return goalDate > now && goalDate <= in24h
    })

    if (upcomingGoals.length === 0) {
      return
    }

    const message = generateReminderMessageForGoals({
      userName: user.name,
      goals: upcomingGoals,
    })

    reminders.push({ userId, message })
    return reminders
  }
}
