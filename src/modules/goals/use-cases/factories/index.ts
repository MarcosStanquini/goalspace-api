import { PrismaSubtaskRepository } from '@/modules/subtasks/repositories/prisma/prisma-subtask-repository'
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma/prisma-users-repository'
import { PrismaGoalsRepository } from '../../repositories/prisma/prisma-goals-repository'
import { CreateGoalUseCase } from '../create'
import { DeleteGoalUseCase } from '../delete'
import { GetGoalByUserUseCase } from '../get-by-user'
import { GetDetailsUseCase } from '../get-details'
import { GetGoalsSummaryUseCase } from '../get-summary'
import { UpdateGoalUseCase } from '../update'

export function makeCreateGoalUseCase() {
  return new CreateGoalUseCase(
    new PrismaGoalsRepository(),
    new PrismaUsersRepository(),
  )
}

export function makeGetGoalByUserUseCase() {
  return new GetGoalByUserUseCase(new PrismaGoalsRepository())
}

export function makeGetDetailsUseCase() {
  return new GetDetailsUseCase(
    new PrismaGoalsRepository(),
    new PrismaSubtaskRepository(),
  )
}

export function makeGetGoalsSummaryUseCase() {
  return new GetGoalsSummaryUseCase(
    new PrismaGoalsRepository(),
    new PrismaSubtaskRepository(),
  )
}

export function makeUpdateGoalUseCase() {
  return new UpdateGoalUseCase(new PrismaGoalsRepository())
}

export function makeDeleteGoalUseCase() {
  return new DeleteGoalUseCase(new PrismaGoalsRepository())
}
