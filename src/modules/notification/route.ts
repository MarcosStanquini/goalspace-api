import { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { updateSettings } from './controllers/update-settings'
import { getSettings } from './controllers/get-settings'

const notificationSettingsSchema = {
  type: 'object',
  properties: {
    remindBefore24h: { type: 'boolean' },
    remindBefore1h: { type: 'boolean' },
    onGoalCompleted: { type: 'boolean' },
    weeklyReport: { type: 'boolean' },
    achievementAlert: { type: 'boolean' },
  },
} as const

export async function NotificationSettingRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get(
    '/notificationSettings',
    {
      schema: {
        description: 'Obter configurações de notificação',
        tags: ['Notifications'],
        security: [{ Bearer: [] }],
        response: {
          200: notificationSettingsSchema,
        },
      },
    },
    getSettings,
  )

  app.patch(
    '/notificationSettings',
    {
      schema: {
        description:
          'Atualizar configurações de notificação (cria na primeira vez)',
        tags: ['Notifications'],
        security: [{ Bearer: [] }],
        body: notificationSettingsSchema,
        response: {
          200: notificationSettingsSchema,
        },
      },
    },
    updateSettings,
  )
}
