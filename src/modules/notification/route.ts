import { FastifyInstance } from 'fastify'

import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { updateSettings } from './controllers/update-settings'

export async function NotificationSettingRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)
  app.patch('/notificationSettings', updateSettings)
}
