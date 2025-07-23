import { FastifyInstance } from 'fastify'
import { create } from './controllers/create'
import { getGoalByUser } from './controllers/get-by-user'
import { updateGoal } from './controllers/update'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { getDetails } from './controllers/get-details'

export async function GoalRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post('/goals', create)
  app.get('/goals', getGoalByUser)
  app.get('/goals/:id', getDetails)
  app.patch('/goals/:id', updateGoal)
}
