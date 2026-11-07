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
  findById(id: string): Promise<SubTask | null>
  findManyByGoalId(goal_id: string): Promise<SubTask[]>
  findManyByGoalIds(goal_ids: string[]): Promise<SubTask[]>
  update(id: string, data: UpdateSubTaskInput): Promise<SubTask>
  delete(id: string): Promise<void>
}
