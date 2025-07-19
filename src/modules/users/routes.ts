import { FastifyInstance } from 'fastify'
import { register } from './controllers/register'

export async function UserRoutes(app: FastifyInstance) {
  app.post('/users', register)
}
