import { FastifyInstance } from 'fastify'
import { create } from './controllers/create'
import { getGoalByUser } from './controllers/get-by-user'
import { updateGoal } from './controllers/update'
import { verifyJWT } from '@/http/middlewares/verify-jwt'

export async function GoalRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post('/goals', create)
  app.get('/goals', getGoalByUser)
  app.patch('/goals/:id', updateGoal)
}
