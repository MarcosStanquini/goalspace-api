import { FastifyReply, FastifyRequest } from 'fastify'
import { makeGetAllUseCase } from '../use-cases/factories'

export async function getAll(_: FastifyRequest, reply: FastifyReply) {
  const getAllUseCase = makeGetAllUseCase()
  const users = await getAllUseCase.execute()

  return reply.status(200).send(users)
}
