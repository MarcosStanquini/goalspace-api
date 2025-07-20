import { prisma } from '@/lib/prisma'
import { GoalsRepository, rawGoalInput } from '../goals-repository'

export class PrismaGoalsRepository implements GoalsRepository {
  async updateToCompleted(user_id: string, id: string) {
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
        isCompleted: true,
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

  async create(data: rawGoalInput) {
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
