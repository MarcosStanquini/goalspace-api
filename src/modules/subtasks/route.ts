import { FastifyInstance } from 'fastify'
import { create } from './controllers/create'
import { remove } from './controllers/delete'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { update } from './controllers/update'

export async function SubTaskRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)
  app.post('/goals/:goal_id/subtasks', create)
  app.delete('/subtasks/:id', remove)
  app.patch('/subtask/:id', update)
}
