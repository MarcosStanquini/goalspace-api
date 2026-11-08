import { FastifyReply } from 'fastify'
import { UserNotExistsError } from '@/modules/users/use-cases/errors/user-not-found-error'
import { InstanceNotFound } from '../use-cases/errors/instance-not-found'
import { InstanceNotConnected } from '../use-cases/errors/instance-not-connected'
import { InstanceAlreadyExists } from '../use-cases/errors/instance-already-exists'
import { WhatsappProviderError } from '../use-cases/errors/whatsapp-provider-error'

// Erros comuns a todas as rotas de instância
export function handleInstanceError(err: unknown, reply: FastifyReply) {
  if (err instanceof UserNotExistsError || err instanceof InstanceNotFound) {
    return reply.status(404).send({ message: err.message })
  }
  if (
    err instanceof InstanceNotConnected ||
    err instanceof InstanceAlreadyExists
  ) {
    return reply.status(409).send({ message: err.message })
  }
  if (err instanceof WhatsappProviderError) {
    console.error(err.message)
    return reply
      .status(502)
      .send({ message: 'Failed to communicate with WhatsApp provider.' })
  }
  throw err
}
