import { FastifyInstance } from 'fastify'

import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { update } from './controllers/update'

export async function NotificationSettinRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)
  app.patch('/notificationSettings', update)
}
