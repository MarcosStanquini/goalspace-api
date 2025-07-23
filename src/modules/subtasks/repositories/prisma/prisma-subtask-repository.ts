import { RawSubtaskInput, SubtaskRepository } from '../subtask-repository'
import { prisma } from '@/lib/prisma'

export class PrismaSubtaskRepository implements SubtaskRepository {
  async create(data: RawSubtaskInput) {
    const subtask = await prisma.subTask.create({
      data: {
        description: data.description,
        goal_id: data.goal_id,
      },
    })
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
}
