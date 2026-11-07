import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryGoalsRepository } from '@/modules/goals/repositories/in-memory/in-memory-goals-repository'
import { GoalNotFound } from '@/modules/goals/use-cases/errors/goal-not-found'
import { InMemorySubtaskRepository } from '../repositories/in-memory/in-memory-subtask-repository'
import { CreateSubTaskUseCase } from './create'
import { UpdateSubTaskUseCase } from './update'
import { DeleteSubtaskUseCase } from './delete'
import { SubTaskNotFound } from './errors/subtasks-not-found'

let goalsRepository: InMemoryGoalsRepository
let subtasksRepository: InMemorySubtaskRepository
let goalId: string

describe('Subtasks use cases', () => {
  beforeEach(async () => {
    goalsRepository = new InMemoryGoalsRepository()
    subtasksRepository = new InMemorySubtaskRepository()

    const goal = await goalsRepository.create({
      title: 'Goal',
      deadline: new Date(Date.now() + 60_000),
      user_id: 'owner',
    })
    goalId = goal.id
  })

  it('creates, toggles and deletes a subtask of the own goal', async () => {
    const create = new CreateSubTaskUseCase(subtasksRepository, goalsRepository)
    const update = new UpdateSubTaskUseCase(subtasksRepository, goalsRepository)
    const remove = new DeleteSubtaskUseCase(subtasksRepository, goalsRepository)

    const subtask = await create.execute({
      goal_id: goalId,
      user_id: 'owner',
      description: 'step',
    })
    expect(subtask.isCompleted).toBe(false)

    const updated = await update.execute({
      id: subtask.id,
      user_id: 'owner',
      isCompleted: true,
    })
    expect(updated.isCompleted).toBe(true)

    await remove.execute({ id: subtask.id, user_id: 'owner' })
    expect(subtasksRepository.items).toHaveLength(0)
  })

  it('blocks access to subtasks of another user goal', async () => {
    const create = new CreateSubTaskUseCase(subtasksRepository, goalsRepository)
    const update = new UpdateSubTaskUseCase(subtasksRepository, goalsRepository)
    const remove = new DeleteSubtaskUseCase(subtasksRepository, goalsRepository)

    await expect(
      create.execute({
        goal_id: goalId,
        user_id: 'intruder',
        description: 'x',
      }),
    ).rejects.toBeInstanceOf(GoalNotFound)

    const subtask = await subtasksRepository.create({
      goal_id: goalId,
      description: 'step',
    })

    await expect(
      update.execute({
        id: subtask.id,
        user_id: 'intruder',
        isCompleted: true,
      }),
    ).rejects.toBeInstanceOf(SubTaskNotFound)
    await expect(
      remove.execute({ id: subtask.id, user_id: 'intruder' }),
    ).rejects.toBeInstanceOf(SubTaskNotFound)

    expect(subtasksRepository.items[0].isCompleted).toBe(false)
  })
})
