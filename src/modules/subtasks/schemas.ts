export const subtaskSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    goal_id: { type: 'string' },
    description: { type: 'string' },
    isCompleted: { type: 'boolean' },
  },
} as const
