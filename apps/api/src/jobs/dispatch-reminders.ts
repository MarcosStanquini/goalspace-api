import { makeSendMessageUseCase } from '@/modules/instance/use-cases/factories'
import { Reminder } from '@/modules/notification/use-cases/messages/types'
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma/prisma-users-repository'

// Roda o gerador de lembretes para cada usuário e envia via WhatsApp.
// Erro em um usuário não interrompe o job para os demais.
export async function dispatchReminders(
  jobName: string,
  buildReminders: (userId: string) => Promise<Reminder[]>,
) {
  const usersRepository = new PrismaUsersRepository()
  const sendMessageUseCase = makeSendMessageUseCase()

  try {
    const users = await usersRepository.getAll()
    let sent = 0

    for (const user of users) {
      // Sem WhatsApp conectado não há para onde enviar
      if (!user.instanceName) continue

      try {
        const reminders = await buildReminders(user.id)

        for (const reminder of reminders) {
          await sendMessageUseCase.execute({
            user_id: reminder.userId,
            message: reminder.message,
          })
          sent++
        }
      } catch (err) {
        console.error(`[${jobName}] Error processing user ${user.id}:`, err)
      }
    }

    console.log(`[${jobName}] Finished. Messages sent: ${sent}`)
  } catch (err) {
    console.error(`[${jobName}] General error:`, err)
  }
}
