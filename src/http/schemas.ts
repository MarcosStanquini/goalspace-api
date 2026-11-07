// Schemas compartilhados entre as rotas (documentação Swagger + serialização da resposta).
// Atenção: o Fastify remove da resposta qualquer campo que não esteja declarado no schema.

export const errorResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
  },
} as const

export const messageResponseSchema = errorResponseSchema

export const uuidParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
} as const
