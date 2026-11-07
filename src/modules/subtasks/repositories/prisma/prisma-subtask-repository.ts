import {
  RawSubTaskInput,
  SubtaskRepository,
  UpdateSubTaskInput,
} from '../subtask-repository'
import { prisma } from '@/lib/prisma'

export class PrismaSubtaskRepository implements SubtaskRepository {
  async create(data: RawSubTaskInput) {
    const subtask = await prisma.subTask.create({
      data: {
        description: data.description,
        goal_id: data.goal_id,
      },
    })
    return subtask
  }

  async findById(id: string) {
    const subtask = await prisma.subTask.findUnique({ where: { id } })

    return subtask
  }

  async findManyByGoalId(goal_id: string) {
    const subtasks = await prisma.subTask.findMany({
      where: {
        goal_id,
      },
    })
    return subtasks
  }

  async findManyByGoalIds(goal_ids: string[]) {
    if (goal_ids.length === 0) {
      return []
    }

    const subtasks = await prisma.subTask.findMany({
      where: {
        goal_id: { in: goal_ids },
      },
    })
    return subtasks
  }

  async update(id: string, data: UpdateSubTaskInput) {
    const subtask = await prisma.subTask.update({
      where: { id },
      data: {
        description: data.description,
        isCompleted: data.isCompleted,
      },
    })
    return subtask
  }

  async delete(id: string) {
    await prisma.subTask.delete({ where: { id } })
  }
}
