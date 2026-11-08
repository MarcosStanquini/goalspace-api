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
import fastifyStatic from '@fastify/static'
import { existsSync } from 'node:fs'
import path from 'node:path'
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

// Usada pela Render para saber se o serviço está no ar
app.get('/health', { schema: { hide: true } }, async () => ({ status: 'ok' }))

// Em produção a API também serve o front já buildado (um serviço só, mesma
// origem: sem CORS). Rotas do front que não existem na API caem no index.html.
if (env.WEB_DIST) {
  const root = path.resolve(env.WEB_DIST)

  if (existsSync(root)) {
    app.register(fastifyStatic, { root, wildcard: false })

    app.setNotFoundHandler((request, reply) => {
      if (
        request.method === 'GET' &&
        request.headers.accept?.includes('text/html')
      ) {
        return reply.sendFile('index.html')
      }
      return reply.status(404).send({ message: 'Not found' })
    })
  }
}

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
