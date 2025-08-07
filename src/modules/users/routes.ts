import { FastifyInstance } from 'fastify'
import { register } from './controllers/register'
import { getAll } from './controllers/get-all'
import { verifyAdmin } from '@/http/middlewares/verify-admin'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { update } from './controllers/update'
import { exportPdf } from './export/controllers/export-pdf'
import { updatePassword } from './controllers/update-password'

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
  app.get(
    '/users/export',
    {
      preHandler: [verifyJWT],
    },
    exportPdf,
  )
  app.patch(
    '/users/password',
    {
      preHandler: [verifyJWT],
    },
    updatePassword,
  )
}
