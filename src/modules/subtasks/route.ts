import { FastifyInstance } from 'fastify'
import { create } from './controllers/create'

export async function SubTaskRoutes(app: FastifyInstance) {
  app.post('/goals/:goal_id/subtasks', create)
}
