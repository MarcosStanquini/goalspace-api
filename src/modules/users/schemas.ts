export const userProfileSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string', enum: ['USER', 'ADMIN', 'MODERATOR'] },
    instanceName: { type: 'string', nullable: true },
    ownerNumber: { type: 'string', nullable: true },
  },
} as const
