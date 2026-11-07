import { randomUUID } from 'node:crypto'
import { SubTask } from '@prisma/client'
import {
  RawSubTaskInput,
  SubtaskRepository,
  UpdateSubTaskInput,
} from '../subtask-repository'

export class InMemorySubtaskRepository implements SubtaskRepository {
  public items: SubTask[] = []

  async create(data: RawSubTaskInput) {
    const subtask: SubTask = {
      id: randomUUID(),
      description: data.description,
      goal_id: data.goal_id,
      isCompleted: false,
    }
    this.items.push(subtask)
    return subtask
  }

  async findById(id: string) {
    return this.items.find((item) => item.id === id) ?? null
  }

  async findManyByGoalId(goal_id: string) {
    return this.items.filter((item) => item.goal_id === goal_id)
  }

  async findManyByGoalIds(goal_ids: string[]) {
    return this.items.filter((item) => goal_ids.includes(item.goal_id))
  }

  async update(id: string, data: UpdateSubTaskInput) {
    const subtask = this.items.find((item) => item.id === id)!
    Object.assign(subtask, {
      description: data.description ?? subtask.description,
      isCompleted: data.isCompleted ?? subtask.isCompleted,
    })
    return subtask
  }

  async delete(id: string) {
    this.items = this.items.filter((item) => item.id !== id)
  }
}
