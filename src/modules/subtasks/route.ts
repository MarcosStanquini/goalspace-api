import { FastifyInstance } from 'fastify'
import { create } from './controllers/create'
import { remove } from './controllers/delete'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { update } from './controllers/update'
import { errorResponseSchema, uuidParamsSchema } from '@/http/schemas'
import { subtaskSchema } from './schemas'

export async function SubTaskRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post(
    '/goals/:goal_id/subtasks',
    {
      schema: {
        description: 'Criar nova subtarefa para uma meta',
        tags: ['SubTasks'],
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['goal_id'],
          properties: {
            goal_id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['description'],
          properties: {
            description: { type: 'string' },
          },
        },
        response: {
          201: subtaskSchema,
          404: errorResponseSchema,
        },
      },
    },
    create,
  )

  app.patch(
    '/subtasks/:id',
    {
      schema: {
        description: 'Atualizar uma subtarefa (descrição ou concluída)',
        tags: ['SubTasks'],
        security: [{ Bearer: [] }],
        params: uuidParamsSchema,
        body: {
          type: 'object',
          properties: {
            description: { type: 'string' },
            isCompleted: { type: 'boolean' },
          },
        },
        response: {
          200: subtaskSchema,
          404: errorResponseSchema,
        },
      },
    },
    update,
  )

  app.delete(
    '/subtasks/:id',
    {
      schema: {
        description: 'Excluir uma subtarefa',
        tags: ['SubTasks'],
        security: [{ Bearer: [] }],
        params: uuidParamsSchema,
        response: {
          204: {
            type: 'null',
            description: 'Subtarefa excluída com sucesso',
          },
          404: errorResponseSchema,
        },
      },
    },
    remove,
  )
}
