import { FastifyInstance } from 'fastify'
import { register } from './controllers/register'
import { getAll } from './controllers/get-all'
import { getProfile } from './controllers/get-profile'
import { verifyAdmin } from '@/http/middlewares/verify-admin'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { update } from './controllers/update'
import { exportPdf } from './export/controllers/export-pdf'
import { updatePassword } from './controllers/update-password'
import { errorResponseSchema } from '@/http/schemas'
import { userProfileSchema } from './schemas'

export async function UserRoutes(app: FastifyInstance) {
  app.post(
    '/users',
    {
      schema: {
        description: 'Cadastrar novo usuário',
        tags: ['Users'],
        body: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        response: {
          201: userProfileSchema,
          409: errorResponseSchema,
        },
      },
    },
    register,
  )

  app.get(
    '/users',
    {
      schema: {
        description: 'Listar todos os usuários (apenas admin)',
        tags: ['Users'],
        security: [{ Bearer: [] }],
        response: {
          200: {
            type: 'array',
            items: userProfileSchema,
          },
          403: errorResponseSchema,
        },
      },
      preHandler: [verifyJWT, verifyAdmin],
    },
    getAll,
  )

  app.get(
    '/users/me',
    {
      schema: {
        description: 'Obter o perfil do usuário autenticado',
        tags: ['Users'],
        security: [{ Bearer: [] }],
        response: {
          200: userProfileSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [verifyJWT],
    },
    getProfile,
  )

  app.patch(
    '/users',
    {
      schema: {
        description: 'Atualizar dados do usuário',
        tags: ['Users'],
        security: [{ Bearer: [] }],
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
          },
        },
        response: {
          200: userProfileSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
      preHandler: [verifyJWT],
    },
    update,
  )

  app.get(
    '/users/export',
    {
      schema: {
        description: 'Exportar dados do usuário em PDF',
        tags: ['Users'],
        security: [{ Bearer: [] }],
        produces: ['application/pdf'],
        response: {
          200: {
            type: 'string',
            format: 'binary',
          },
          404: errorResponseSchema,
        },
      },
      preHandler: [verifyJWT],
    },
    exportPdf,
  )

  app.patch(
    '/users/password',
    {
      schema: {
        description: 'Alterar senha do usuário',
        tags: ['Users'],
        security: [{ Bearer: [] }],
        body: {
          type: 'object',
          required: ['current_password', 'new_password'],
          properties: {
            current_password: { type: 'string' },
            new_password: { type: 'string', minLength: 6 },
          },
        },
        response: {
          204: {
            type: 'null',
            description: 'Senha alterada com sucesso',
          },
          400: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [verifyJWT],
    },
    updatePassword,
  )
}
