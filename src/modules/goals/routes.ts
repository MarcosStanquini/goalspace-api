import { FastifyInstance } from 'fastify'
import { create } from './controllers/create'
import { getGoalByUser } from './controllers/get-by-user'
import { markStatusCompleted } from './controllers/mark-completed'

export async function GoalRoutes(app: FastifyInstance) {
  app.post('/goals', create)
  app.get('/goals/:user_id', getGoalByUser)
  app.patch('/users/:user_id/goals/:id', markStatusCompleted)
}
