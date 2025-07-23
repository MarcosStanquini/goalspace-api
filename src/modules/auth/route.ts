import { FastifyInstance } from 'fastify'
import { authenticate } from './controllers/authenticate'

export async function AuthenticateRoutes(app: FastifyInstance) {
  app.post('/sessions', authenticate)
}
