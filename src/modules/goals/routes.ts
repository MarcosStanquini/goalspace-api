import { FastifyInstance } from 'fastify'
import { create } from './controllers/create'
import { getGoalByUser } from './controllers/get-by-user'

export async function GoalRoutes(app: FastifyInstance) {
  app.post('/goals', create)
  app.get('/goals/:user_id', getGoalByUser)
}
