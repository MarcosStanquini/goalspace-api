import { FastifyInstance } from 'fastify'
import { register } from '../../modules/users/controllers/register'

export async function appRoutes(app: FastifyInstance) {
  app.post('/users', register)
}
