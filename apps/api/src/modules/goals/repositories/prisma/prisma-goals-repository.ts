import { prisma } from '@/lib/prisma'
import {
  GoalsRepository,
  GoalUpdateInput,
  RawGoalInput,
} from '../goals-repository'

export class PrismaGoalsRepository implements GoalsRepository {
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

  async findManyByUserId(user_id: string, query?: string) {
    const goals = await prisma.goal.findMany({
      where: {
        user_id,
        title: query
          ? {
              contains: query,
              mode: 'insensitive',
            }
          : undefined,
      },
      orderBy: { deadline: 'asc' },
    })
    return goals
  }

  async findById(id: string) {
    const goal = await prisma.goal.findUnique({
      where: {
        id,
      },
    })
    return goal
  }

  async update(id: string, data: GoalUpdateInput) {
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

  async delete(id: string) {
    // A FK de subtasks é RESTRICT, então as subtarefas precisam sair antes (na mesma transação)
    await prisma.$transaction([
      prisma.subTask.deleteMany({ where: { goal_id: id } }),
      prisma.goal.delete({ where: { id } }),
    ])
  }
}
