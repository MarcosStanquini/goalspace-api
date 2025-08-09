import { FastifyInstance } from 'fastify'
import { create } from './controllers/create'
import { remove } from './controllers/delete'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { update } from './controllers/update'

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
          201: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          409: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    create,
  )

  app.delete(
    '/subtasks/:id',
    {
      schema: {
        description: 'Excluir uma subtarefa',
        tags: ['SubTasks'],
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    remove,
  )

  app.patch(
    '/subtask/:id',
    {
      schema: {
        description: 'Atualizar uma subtarefa',
        tags: ['SubTasks'],
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          properties: {
            description: { type: 'string' },
            isCompleted: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    update,
  )
}
