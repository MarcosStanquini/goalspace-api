import { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { errorResponseSchema } from '@/http/schemas'

import { whatsappConnect } from './controllers/handle-whatsapp-connection'
import { getStatus } from './controllers/get-status'
import { disconnectInstance } from './controllers/disconnect'
import { sendMessage } from './controllers/send-message'

const instanceErrors = {
  404: errorResponseSchema,
  409: errorResponseSchema,
  502: errorResponseSchema,
} as const

export async function InstanceRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post(
    '/instance/connect',
    {
      schema: {
        description:
          'Cria a instância WhatsApp (se necessário) e retorna o QR Code. qrCode = null quando já está conectado.',
        tags: ['Instance'],
        security: [{ Bearer: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              instanceName: { type: 'string' },
              qrCode: { type: 'string', nullable: true },
              connected: { type: 'boolean' },
            },
          },
          ...instanceErrors,
        },
      },
    },
    whatsappConnect,
  )

  app.get(
    '/instance/status',
    {
      schema: {
        description:
          'Estado da conexão WhatsApp. Faça polling após exibir o QR Code até connected = true.',
        tags: ['Instance'],
        security: [{ Bearer: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              instanceName: { type: 'string', nullable: true },
              state: {
                type: 'string',
                enum: ['not_created', 'open', 'connecting', 'close'],
              },
              connected: { type: 'boolean' },
              ownerNumber: { type: 'string', nullable: true },
            },
          },
          ...instanceErrors,
        },
      },
    },
    getStatus,
  )

  app.delete(
    '/instance/logout',
    {
      schema: {
        description: 'Desconectar instância WhatsApp',
        tags: ['Instance'],
        security: [{ Bearer: [] }],
        response: {
          204: { type: 'null', description: 'Desconectado com sucesso' },
          ...instanceErrors,
        },
      },
    },
    disconnectInstance,
  )

  app.post(
    '/message/sendMessage',
    {
      schema: {
        description:
          'Envia uma mensagem de teste para o próprio WhatsApp conectado',
        tags: ['Instance'],
        security: [{ Bearer: [] }],
        body: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string', minLength: 1 },
          },
        },
        response: {
          204: { type: 'null', description: 'Mensagem enviada' },
          ...instanceErrors,
        },
      },
    },
    sendMessage,
  )
}
