import { prisma } from '@/lib/prisma'
import {
  GoalsRepository,
  goalUpdateInput,
  RawGoalInput,
} from '../goals-repository'

export class PrismaGoalsRepository implements GoalsRepository {
  async update(user_id: string, id: string, data: goalUpdateInput) {
    const goal = await prisma.goal.findFirst({
      where: {
        user_id,
        id,
      },
    })

    if (!goal) {
      return null
    }

    return await prisma.goal.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        isCompleted: data.isCompleted,
        deadline: data.deadline,
      },
    })
  }

  async findManyByUserId(user_id: string) {
    const goals = await prisma.goal.findMany({
      where: {
        user_id,
      },
    })
    return goals
  }

  async create(data: RawGoalInput) {
    const goal = await prisma.goal.create({
      data: {
        title: data.title,
        description: data.description,
        deadline: data.deadline,
        user: {
          connect: { id: data.user_id },
        },
      },
    })
    return goal
  }
}
