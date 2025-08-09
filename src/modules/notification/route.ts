import { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { updateSettings } from './controllers/update-settings'

export async function NotificationSettingRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.patch(
    '/notificationSettings',
    {
      schema: {
        description: 'Atualizar configurações de notificação',
        tags: ['Notifications'],
        security: [{ Bearer: [] }],
        body: {
          type: 'object',
          properties: {
            remindBefore24h: { type: 'boolean' },
            remindBefore1h: { type: 'boolean' },
            onGoalCompleted: { type: 'boolean' },
            weeklyReport: { type: 'boolean' },
            achievementAlert: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    updateSettings,
  )
}
