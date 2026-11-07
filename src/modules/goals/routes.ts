import { FastifyInstance } from 'fastify'
import { create } from './controllers/create'
import { getGoalByUser } from './controllers/get-by-user'
import { updateGoal } from './controllers/update'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { getDetails } from './controllers/get-details'
import { getSummary } from './controllers/get-summary'
import { remove } from './controllers/delete'
import { errorResponseSchema, uuidParamsSchema } from '@/http/schemas'
import {
  deadlineBodySchema,
  goalDetailsSchema,
  goalSchema,
  goalsSummarySchema,
} from './schemas'

export async function GoalRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post(
    '/goals',
    {
      schema: {
        description: 'Criar nova meta',
        tags: ['Goals'],
        security: [{ Bearer: [] }],
        body: {
          type: 'object',
          required: ['title', 'deadline'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            deadline: deadlineBodySchema,
          },
        },
        response: {
          201: goalSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    create,
  )

  app.get(
    '/goals',
    {
      schema: {
        description: 'Listar metas do usuário (ordenadas pelo prazo)',
        tags: ['Goals'],
        security: [{ Bearer: [] }],
        querystring: {
          type: 'object',
          properties: {
            goal_status: {
              type: 'string',
              enum: ['active', 'expired', 'completed'],
              description: 'Filtrar por status da meta',
            },
            title_search: {
              type: 'string',
              description: 'Buscar por título da meta',
            },
          },
        },
        response: {
          200: {
            type: 'array',
            items: goalSchema,
          },
        },
      },
    },
    getGoalByUser,
  )

  app.get(
    '/goals/summary',
    {
      schema: {
        description: 'Dashboard resumido do progresso do usuário',
        tags: ['Goals'],
        security: [{ Bearer: [] }],
        response: {
          200: goalsSummarySchema,
        },
      },
    },
    getSummary,
  )

  app.get(
    '/goals/:id',
    {
      schema: {
        description: 'Obter detalhes de uma meta específica',
        tags: ['Goals'],
        security: [{ Bearer: [] }],
        params: uuidParamsSchema,
        response: {
          200: goalDetailsSchema,
          404: errorResponseSchema,
        },
      },
    },
    getDetails,
  )

  app.patch(
    '/goals/:id',
    {
      schema: {
        description: 'Atualizar uma meta',
        tags: ['Goals'],
        security: [{ Bearer: [] }],
        params: uuidParamsSchema,
        body: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            deadline: deadlineBodySchema,
            isCompleted: { type: 'boolean' },
          },
        },
        response: {
          200: goalSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    updateGoal,
  )

  app.delete(
    '/goals/:id',
    {
      schema: {
        description: 'Excluir uma meta e suas subtarefas',
        tags: ['Goals'],
        security: [{ Bearer: [] }],
        params: uuidParamsSchema,
        response: {
          204: {
            type: 'null',
            description: 'Meta excluída com sucesso',
          },
          404: errorResponseSchema,
        },
      },
    },
    remove,
  )
}
