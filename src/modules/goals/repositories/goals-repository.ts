import { Goal } from '@prisma/client'

export interface RawGoalInput {
  title: string
  description?: string
  deadline: Date
  user_id: string
}

export interface goalUpdateInput {
  title?: string
  description?: string
  deadline?: Date
  isCompleted?: boolean
}

export interface GoalsRepository {
  create(data: RawGoalInput): Promise<Goal>
  findManyByUserId(user_id: string, query?: string): Promise<Goal[] | null>
  update(
    user_id: string,
    id: string,
    data: goalUpdateInput,
  ): Promise<Goal | null>
  findById(id: string): Promise<Goal | null>
  deleteById(id: string): Promise<boolean | null>
}
