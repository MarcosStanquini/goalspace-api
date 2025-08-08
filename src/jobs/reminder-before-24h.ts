import cron from 'node-cron'
import { SendMessageUseCase } from '@/modules/instance/use-cases/send-message'
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma/prisma-users-repository'
import { PrismaGoalsRepository } from '@/modules/goals/repositories/prisma/prisma-goals-repository'
import { PrismaNotificationRepository } from '@/modules/notification/repositories/prisma/prisma-notification-repository'
import { ReminderBefore24hUseCase } from '@/modules/notification/use-cases/messages/reminder-before-24h'

const usersRepository = new PrismaUsersRepository()
const goalsRepository = new PrismaGoalsRepository()
const notificationSettingsRepository = new PrismaNotificationRepository()

const reminderUseCase = new ReminderBefore24hUseCase(
  notificationSettingsRepository,
  usersRepository,
  goalsRepository,
)

const sendMessageUseCase = new SendMessageUseCase(usersRepository)

cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Running 24 reminder job...')

    const allUsers = await usersRepository.getAll()

    for (const user of allUsers) {
      try {
        const reminders = await reminderUseCase.execute(user.id)

        if (reminders && reminders.length > 0) {
          for (const reminder of reminders) {
            try {
              const result = await sendMessageUseCase.execute({
                user_id: reminder.userId,
                message: reminder.message,
              })

              console.log(`Message sent to user ${reminder.userId}: ${result}`)
            } catch (err) {
              console.error(
                `Error sending message to user ${reminder.userId}:`,
                err,
              )
            }
          }
        }
      } catch (err) {
        console.error(`Error processing reminders for user ${user.id}:`, err)
      }
    }
  } catch (err) {
    console.error('General error in reminder job:', err)
  }
})
