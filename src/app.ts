import fastify from 'fastify'
import { ZodError } from 'zod'
import { env } from './env'
import { UserRoutes } from './modules/users/routes'
import { GoalRoutes } from './modules/goals/routes'
import { AuthenticateRoutes } from './modules/auth/route'
import fastifyJwt from '@fastify/jwt'
import { SubTaskRoutes } from './modules/subtasks/route'

export const app = fastify()

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(UserRoutes)
app.register(GoalRoutes)
app.register(AuthenticateRoutes)
app.register(SubTaskRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error', issues: error.format() })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  }

  return reply.status(500).send({ message: 'Internal server error!' })
})
