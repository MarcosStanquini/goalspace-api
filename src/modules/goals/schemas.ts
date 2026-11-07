import { z } from 'zod'
import { subtaskSchema } from '@/modules/subtasks/schemas'

// ISO 8601 com fuso obrigatório (2025-12-31T23:59:00Z / 2025-12-31T23:59:00-03:00),
// assim o horário não depende do fuso do servidor
export const deadlineZodSchema = z
  .string()
  .datetime({ offset: true })
  .transform((value) => new Date(value))

export const goalSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string', nullable: true },
    deadline: { type: 'string', format: 'date-time' },
    created_at: { type: 'string', format: 'date-time' },
    isCompleted: { type: 'boolean' },
    goal_status: { type: 'string', enum: ['active', 'expired', 'completed'] },
  },
} as const

export const goalDetailsSchema = {
  type: 'object',
  properties: {
    ...goalSchema.properties,
    subtasks: {
      type: 'array',
      items: subtaskSchema,
    },
  },
} as const

export const goalsSummarySchema = {
  type: 'object',
  properties: {
    goals: {
      type: 'object',
      properties: {
        total: { type: 'integer' },
        active: { type: 'integer' },
        completed: { type: 'integer' },
        expired: { type: 'integer' },
        due_soon: { type: 'integer' },
      },
    },
    subtasks: {
      type: 'object',
      properties: {
        total: { type: 'integer' },
        completed: { type: 'integer' },
      },
    },
    completion_rate: { type: 'integer', description: 'Percentual (0-100)' },
  },
} as const

export const deadlineBodySchema = {
  type: 'string',
  format: 'date-time',
  description: 'ISO 8601 com fuso (ex: 2025-12-31T23:59:00-03:00)',
} as const
