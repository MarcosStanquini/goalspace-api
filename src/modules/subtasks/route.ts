import { FastifyInstance } from 'fastify'
import { create } from './controllers/create'
import { remove } from './controllers/delete'

export async function SubTaskRoutes(app: FastifyInstance) {
  app.post('/goals/:goal_id/subtasks', create)
  app.delete('/subtasks/:id', remove)
}
