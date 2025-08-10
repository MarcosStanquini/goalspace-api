import { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'

import { whatsappConnect } from './controllers/handle-whatsapp-connection'
import { desconnectInstance } from './controllers/desconnect'
import { verifyConnected } from '@/http/middlewares/verify-connected'
import { verifyOwnerNumber } from '@/http/middlewares/verify-number-owner'
import { sendMessage } from './controllers/send-message'

export async function InstanceRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get(
    '/instance/connect',
    {
      schema: {
        description: 'Processar conexão WhatsApp',
        tags: ['Instance'],
        security: [{ Bearer: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              instanceName: { type: 'string' },
              qrCode: { type: 'string' },
            },
          },
          500: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
      preHandler: [verifyOwnerNumber],
    },
    whatsappConnect,
  )

  app.delete(
    '/instance/logout',
    {
      schema: {
        description: 'Desconectar instância WhatsApp',
        tags: ['Instance'],
        security: [{ Bearer: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          500: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
      preHandler: [verifyConnected],
    },
    desconnectInstance,
  )

  app.post(
    '/message/sendMessage',
    {
      schema: {
        description: 'Enviar mensagem via WhatsApp',
        tags: ['Instance'],
        security: [{ Bearer: [] }],
        body: {
          type: 'object',
          required: ['number', 'message'],
          properties: {
            number: { type: 'string', pattern: '^[0-9]{10,15}$' },
            message: { type: 'string', minLength: 1 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              messageId: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          500: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
      preHandler: [verifyConnected, verifyOwnerNumber],
    },
    sendMessage,
  )
}
