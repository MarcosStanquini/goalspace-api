import { randomUUID } from 'node:crypto'
import { Goal } from '@prisma/client'
import {
  GoalsRepository,
  GoalUpdateInput,
  RawGoalInput,
} from '../goals-repository'

export class InMemoryGoalsRepository implements GoalsRepository {
  public items: Goal[] = []

  async create(data: RawGoalInput) {
    const goal: Goal = {
      id: randomUUID(),
      title: data.title,
      description: data.description ?? null,
      deadline: data.deadline,
      isCompleted: false,
      created_at: new Date(),
      user_id: data.user_id,
    }
    this.items.push(goal)
    return goal
  }

  async findManyByUserId(user_id: string, query?: string) {
    return this.items
      .filter((item) => item.user_id === user_id)
      .filter((item) =>
        query ? item.title.toLowerCase().includes(query.toLowerCase()) : true,
      )
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
  }

  async findById(id: string) {
    return this.items.find((item) => item.id === id) ?? null
  }

  async update(id: string, data: GoalUpdateInput) {
    const goal = this.items.find((item) => item.id === id)!
    Object.assign(goal, {
      title: data.title ?? goal.title,
      description: data.description ?? goal.description,
      deadline: data.deadline ?? goal.deadline,
      isCompleted: data.isCompleted ?? goal.isCompleted,
    })
    return goal
  }

  async delete(id: string) {
    this.items = this.items.filter((item) => item.id !== id)
  }
}
