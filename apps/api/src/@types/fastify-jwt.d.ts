import '@fastify/jwt'
import { Role } from '@prisma/client'

declare module '@fastify/jwt' {
  export interface FastifyJWT {
    payload: {
      name: string
      role: Role
    }
    user: {
      sub: string
      name: string
      role: Role
    }
  }
}
