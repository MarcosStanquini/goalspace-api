import { FastifyInstance } from 'fastify'
import { create } from './controllers/create'

export async function GoalsRoutes(app: FastifyInstance) {
  app.post('/goals', create)
}
