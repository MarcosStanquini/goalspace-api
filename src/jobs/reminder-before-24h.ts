import cron from 'node-cron'
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma/prisma-users-repository'
import { PrismaGoalsRepository } from '@/modules/goals/repositories/prisma/prisma-goals-repository'
import { PrismaNotificationRepository } from '@/modules/notification/repositories/prisma/prisma-notification-repository'
import { ReminderBefore24hUseCase } from '@/modules/notification/use-cases/messages/reminder-before-24h'
import { dispatchReminders } from './dispatch-reminders'

const reminderUseCase = new ReminderBefore24hUseCase(
  new PrismaNotificationRepository(),
  new PrismaUsersRepository(),
  new PrismaGoalsRepository(),
)

// Todo dia à meia-noite: metas que vencem nas próximas 24 horas
cron.schedule('0 0 * * *', () =>
  dispatchReminders('reminder-24h', (userId) =>
    reminderUseCase.execute(userId),
  ),
)
