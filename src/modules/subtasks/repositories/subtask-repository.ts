import { SubTask } from '@prisma/client'

export interface RawSubTaskInput {
  description: string
  goal_id: string
}

export interface UpdateSubTaskInput {
  description?: string
  isCompleted?: boolean
}

export interface SubtaskRepository {
  create(data: RawSubTaskInput): Promise<SubTask>
  findManyByGoalId(goal_id: string): Promise<SubTask[] | null>
  delete(id: string): Promise<boolean | null>
  deleteManyByGoalId(goal_id: string): Promise<boolean | null>
  findById(id: string): Promise<SubTask | null>
  update(id: string, data: UpdateSubTaskInput): Promise<SubTask | null>
}
