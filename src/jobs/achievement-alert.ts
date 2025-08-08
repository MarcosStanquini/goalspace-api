import cron from 'node-cron'

import { SendMessageUseCase } from '@/modules/instance/use-cases/send-message'
import { AchievementAlertUseCase } from '@/modules/notification/use-cases/messages/achievement-alert'
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma/prisma-users-repository'
import { PrismaNotificationRepository } from '@/modules/notification/repositories/prisma/prisma-notification-repository'
import { PrismaGoalsRepository } from '@/modules/goals/repositories/prisma/prisma-goals-repository'

const usersRepository = new PrismaUsersRepository()
const goalsRepository = new PrismaGoalsRepository()
const notificationSettingsRepository = new PrismaNotificationRepository()

const achievementAlertUseCase = new AchievementAlertUseCase(
  usersRepository,
  goalsRepository,
  notificationSettingsRepository,
)

const sendMessageUseCase = new SendMessageUseCase(usersRepository)

cron.schedule('0 8 * * 1', async () => {
  const allUsers = await usersRepository.getAll()

  for (const user of allUsers) {
    const reminders = await achievementAlertUseCase.execute(user.id)

    if (reminders && reminders.length > 0) {
      for (const reminder of reminders) {
        await sendMessageUseCase.execute({
          user_id: reminder.userId,
          message: reminder.message,
        })
        console.log(`Achievement message sent to user ${reminder.userId}`)
      }
    }
  }
})
