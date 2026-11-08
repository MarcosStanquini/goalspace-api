import cron from 'node-cron'
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma/prisma-users-repository'
import { PrismaGoalsRepository } from '@/modules/goals/repositories/prisma/prisma-goals-repository'
import { ReminderBefore1hUseCase } from '@/modules/notification/use-cases/messages/reminder-before-1h'
import { PrismaNotificationRepository } from '@/modules/notification/repositories/prisma/prisma-notification-repository'
import { dispatchReminders } from './dispatch-reminders'

const reminderUseCase = new ReminderBefore1hUseCase(
  new PrismaNotificationRepository(),
  new PrismaUsersRepository(),
  new PrismaGoalsRepository(),
)

// A cada hora cheia: metas que vencem na próxima 1 hora
cron.schedule('0 * * * *', () =>
  dispatchReminders('reminder-1h', (userId) => reminderUseCase.execute(userId)),
)
