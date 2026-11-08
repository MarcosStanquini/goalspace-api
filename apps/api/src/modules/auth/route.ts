import { FastifyInstance } from 'fastify'
import { errorResponseSchema } from '@/http/schemas'
import { authenticate } from './controllers/authenticate'

export async function AuthenticateRoutes(app: FastifyInstance) {
  app.post(
    '/sessions',
    {
      schema: {
        description: 'Autenticar usuário e gerar token JWT',
        tags: ['Authentication'],
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              token: { type: 'string' },
            },
          },
          401: errorResponseSchema,
        },
      },
    },
    authenticate,
  )
}
