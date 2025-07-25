import { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const user = request.user as { sub: string; name: string; role: string }

  console.log(user)
  if (user.role !== 'ADMIN') {
    return reply.status(403).send({ message: 'Acesso negado: apenas admins.' })
  }
}
