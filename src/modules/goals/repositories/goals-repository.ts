import { Goal } from '@prisma/client'

export interface RawGoalInput {
  title: string
  description?: string
  deadline: Date
  user_id: string
}

export interface GoalUpdateInput {
  title?: string
  description?: string
  deadline?: Date
  isCompleted?: boolean
}

export interface GoalsRepository {
  create(data: RawGoalInput): Promise<Goal>
  findManyByUserId(user_id: string, query?: string): Promise<Goal[]>
  findById(id: string): Promise<Goal | null>
  update(id: string, data: GoalUpdateInput): Promise<Goal>
  // Remove a meta junto com as suas subtarefas
  delete(id: string): Promise<void>
}
