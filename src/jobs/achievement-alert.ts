import cron from 'node-cron'
import { AchievementAlertUseCase } from '@/modules/notification/use-cases/messages/achievement-alert'
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma/prisma-users-repository'
import { PrismaNotificationRepository } from '@/modules/notification/repositories/prisma/prisma-notification-repository'
import { PrismaGoalsRepository } from '@/modules/goals/repositories/prisma/prisma-goals-repository'
import { dispatchReminders } from './dispatch-reminders'

const achievementAlertUseCase = new AchievementAlertUseCase(
  new PrismaUsersRepository(),
  new PrismaGoalsRepository(),
  new PrismaNotificationRepository(),
)

// Toda segunda-feira às 8h
cron.schedule('0 8 * * 1', () =>
  dispatchReminders('achievement-alert', (userId) =>
    achievementAlertUseCase.execute(userId),
  ),
)
