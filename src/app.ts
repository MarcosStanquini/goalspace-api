import fastify from 'fastify'
import { ZodError } from 'zod'
import { env } from './env'
import { UserRoutes } from './modules/users/routes'
import { GoalRoutes } from './modules/goals/routes'
import { AuthenticateRoutes } from './modules/auth/route'
import fastifyJwt from '@fastify/jwt'
import fastifyCors from '@fastify/cors'
import { SubTaskRoutes } from './modules/subtasks/route'
import { InstanceRoutes } from './modules/instance/route'
import { NotificationSettingRoutes } from './modules/notification/route'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
export const app = fastify()

app.register(fastifyCors, {
  origin:
    env.CORS_ORIGIN === '*'
      ? true
      : env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  exposedHeaders: ['Content-Disposition'],
})

app.register(fastifySwagger, {
  swagger: {
    info: {
      title: 'GoalSpace API',
      description:
        'API RESTful para gerenciamento de metas pessoais e profissionais. Permite criar, acompanhar e gerenciar objetivos com subtarefas, sistema de notificações WhatsApp e controle de prazos.',
      version: '1.0.0',
    },
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'Authentication', description: 'Autenticação e login' },
      { name: 'Users', description: 'Gerenciamento de usuários' },
      { name: 'Goals', description: 'Gerenciamento de metas' },
      { name: 'SubTasks', description: 'Gerenciamento de subtarefas' },
      { name: 'Instance', description: 'Gerenciamento de instâncias WhatsApp' },
      { name: 'Notifications', description: 'Configurações de notificações' },
    ],
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description:
          'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"',
      },
    },
  },
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(AuthenticateRoutes)
app.register(UserRoutes)
app.register(GoalRoutes)
app.register(SubTaskRoutes)
app.register(InstanceRoutes)
app.register(NotificationSettingRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error', issues: error.format() })
  }

  // Erros de validação do schema do Fastify (body, params, querystring)
  if (error.validation) {
    return reply
      .status(400)
      .send({ message: 'Validation error', issues: error.validation })
  }

  // Erros do próprio Fastify/plugins com status de cliente (ex: JSON malformado)
  if (error.statusCode && error.statusCode < 500) {
    return reply.status(error.statusCode).send({ message: error.message })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  }

  return reply.status(500).send({ message: 'Internal server error!' })
})
