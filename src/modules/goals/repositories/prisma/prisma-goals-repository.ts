import { prisma } from '@/lib/prisma'
import { GoalsRepository, rawGoalInput } from '../goals-repository'

export class PrismaGoalsRepository implements GoalsRepository {
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
