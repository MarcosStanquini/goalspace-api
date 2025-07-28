import { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { createInstance } from './controllers/create'
import { connectInstance } from './controllers/connect'
import { whatsappConnect } from './controllers/handle-whatsapp-connection'
import { desconnectInstance } from './controllers/desconnect'
import { verifyConnected } from '@/http/middlewares/verify-connected'

export async function InstanceRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)
  app.post('/instance/create', createInstance)
  app.get('/instance/connect/:instanceName', connectInstance)
  app.post('/instance/connect', whatsappConnect)

  app.delete(
    '/instance/logout',
    {
      preHandler: [verifyJWT, verifyConnected],
    },
    desconnectInstance,
  )
}
