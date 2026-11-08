import { PrismaGoalsRepository } from '@/modules/goals/repositories/prisma/prisma-goals-repository'
import { PrismaSubtaskRepository } from '../../repositories/prisma/prisma-subtask-repository'
import { CreateSubTaskUseCase } from '../create'
import { DeleteSubtaskUseCase } from '../delete'
import { UpdateSubTaskUseCase } from '../update'

export function makeCreateSubTaskUseCase() {
  return new CreateSubTaskUseCase(
    new PrismaSubtaskRepository(),
    new PrismaGoalsRepository(),
  )
}

export function makeUpdateSubTaskUseCase() {
  return new UpdateSubTaskUseCase(
    new PrismaSubtaskRepository(),
    new PrismaGoalsRepository(),
  )
}

export function makeDeleteSubtaskUseCase() {
  return new DeleteSubtaskUseCase(
    new PrismaSubtaskRepository(),
    new PrismaGoalsRepository(),
  )
}
