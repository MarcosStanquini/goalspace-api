import { FastifyInstance } from 'fastify'
import { create } from './controllers/create'
import { getGoalByUser } from './controllers/get-by-user'
import { updateGoal } from './controllers/update'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { getDetails } from './controllers/get-details'
import { remove } from './controllers/delete'

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
            deadline: {
              type: 'string',
              pattern:
                '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{3})?(Z|([+-]\\d{2}:\\d{2}))?$',
              description: 'Data e hora no formato ISO 8601',
            },
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

  app.get(
    '/goals',
    {
      schema: {
        description: 'Listar metas do usuário',
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
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                deadline: { type: 'string', format: 'date-time' },
                status: { type: 'string' },
                isCompleted: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
          404: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    getGoalByUser,
  )

  app.get(
    '/goals/:id',
    {
      schema: {
        description: 'Obter detalhes de uma meta específica',
        tags: ['Goals'],
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
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              deadline: { type: 'string', format: 'date-time' },
              status: { type: 'string' },
              isCompleted: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              subtasks: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    description: { type: 'string' },
                    isCompleted: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          404: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
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
            title: { type: 'string' },
            description: { type: 'string' },
            deadline: {
              type: 'string',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
              description: 'Data no formato YYYY-MM-DD',
            },
            isCompleted: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              deadline: { type: 'string', format: 'date-time' },
              status: { type: 'string' },
              isCompleted: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          404: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
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
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          204: {
            type: 'null',
            description: 'Meta excluída com sucesso',
          },
          404: {
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
}
