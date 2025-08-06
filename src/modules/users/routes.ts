import { FastifyInstance } from 'fastify'
import { register } from './controllers/register'
import { getAll } from './controllers/get-all'
import { verifyAdmin } from '@/http/middlewares/verify-admin'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { update } from './controllers/update'

export async function UserRoutes(app: FastifyInstance) {
  app.post('/users', register)

  app.get(
    '/users',
    {
      preHandler: [verifyJWT, verifyAdmin],
    },
    getAll,
  )
  app.patch(
    '/users',
    {
      preHandler: [verifyJWT],
    },
    update,
  )
}
