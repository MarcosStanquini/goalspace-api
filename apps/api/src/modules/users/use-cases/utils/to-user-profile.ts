import { User } from '@prisma/client'

// Remove dados sensíveis (password_hash) antes de expor o usuário
export function toUserProfile(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    instanceName: user.instanceName,
    ownerNumber: user.ownerNumber,
  }
}

export type UserProfile = ReturnType<typeof toUserProfile>
