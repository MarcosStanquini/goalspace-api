import { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { createInstance } from './controllers/create'

export async function InstanceRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)
  app.post('/instance/create', createInstance)
}
