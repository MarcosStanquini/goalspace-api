import { Goal } from '@prisma/client'

export interface rawGoalInput {
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
  create(data: rawGoalInput): Promise<Goal>
  findManyByUserId(user_id: string): Promise<Goal[] | null>
  update(
    user_id: string,
    id: string,
    data: goalUpdateInput,
  ): Promise<Goal | null>
}
