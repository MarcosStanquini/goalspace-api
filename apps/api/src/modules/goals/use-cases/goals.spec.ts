import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryGoalsRepository } from '../repositories/in-memory/in-memory-goals-repository'
import { InMemorySubtaskRepository } from '@/modules/subtasks/repositories/in-memory/in-memory-subtask-repository'
import { InMemoryUsersRepository } from '@/modules/users/repositories/in-memory/in-memory-users-repository'
import { CreateGoalUseCase } from './create'
import { GetGoalByUserUseCase } from './get-by-user'
import { GetDetailsUseCase } from './get-details'
import { UpdateGoalUseCase } from './update'
import { DeleteGoalUseCase } from './delete'
import { GetGoalsSummaryUseCase } from './get-summary'
import { GoalNotFound } from './errors/goal-not-found'
import { InvalidDeadline } from './errors/invalid-deadline'

const DAY = 24 * 60 * 60 * 1000

let usersRepository: InMemoryUsersRepository
let goalsRepository: InMemoryGoalsRepository
let subtasksRepository: InMemorySubtaskRepository
let ownerId: string
let otherUserId: string

describe('Goals use cases', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository()
    goalsRepository = new InMemoryGoalsRepository()
    subtasksRepository = new InMemorySubtaskRepository()

    const owner = await usersRepository.create({
      name: 'Owner',
      email: 'owner@example.com',
      password_hash: 'x',
    })
    const other = await usersRepository.create({
      name: 'Other',
      email: 'other@example.com',
      password_hash: 'x',
    })
    ownerId = owner.id
    otherUserId = other.id
  })

  it('creates a goal and returns it with the calculated status', async () => {
    const sut = new CreateGoalUseCase(goalsRepository, usersRepository)

    const goal = await sut.execute({
      title: 'Learn TS',
      deadline: new Date(Date.now() + DAY),
      user_id: ownerId,
    })

    expect(goal.id).toEqual(expect.any(String))
    expect(goal.goal_status).toBe('active')
    expect(goal).not.toHaveProperty('user_id')
  })

  it('rejects a deadline in the past', async () => {
    const sut = new CreateGoalUseCase(goalsRepository, usersRepository)

    await expect(
      sut.execute({
        title: 'Late',
        deadline: new Date(Date.now() - DAY),
        user_id: ownerId,
      }),
    ).rejects.toBeInstanceOf(InvalidDeadline)
  })

  it('lists an empty array when the user has no goals', async () => {
    const sut = new GetGoalByUserUseCase(goalsRepository, subtasksRepository)

    await expect(sut.execute({ user_id: ownerId })).resolves.toEqual([])
  })

  it('filters goals by status', async () => {
    const active = await goalsRepository.create({
      title: 'Active',
      deadline: new Date(Date.now() + DAY),
      user_id: ownerId,
    })
    const done = await goalsRepository.create({
      title: 'Done',
      deadline: new Date(Date.now() + DAY),
      user_id: ownerId,
    })
    await goalsRepository.update(done.id, { isCompleted: true })
    await goalsRepository.create({
      title: 'Expired',
      deadline: new Date(Date.now() - DAY),
      user_id: ownerId,
    })

    const sut = new GetGoalByUserUseCase(goalsRepository, subtasksRepository)

    const activeGoals = await sut.execute({
      user_id: ownerId,
      goal_status: 'active',
    })
    expect(activeGoals.map((goal) => goal.id)).toEqual([active.id])

    const expired = await sut.execute({
      user_id: ownerId,
      goal_status: 'expired',
    })
    expect(expired).toHaveLength(1)
  })

  it('does not expose, update or delete another user goal', async () => {
    const goal = await goalsRepository.create({
      title: 'Private',
      deadline: new Date(Date.now() + DAY),
      user_id: ownerId,
    })

    const details = new GetDetailsUseCase(goalsRepository, subtasksRepository)
    const update = new UpdateGoalUseCase(goalsRepository)
    const remove = new DeleteGoalUseCase(goalsRepository)

    await expect(
      details.execute({ id: goal.id, user_id: otherUserId }),
    ).rejects.toBeInstanceOf(GoalNotFound)
    await expect(
      update.execute({ id: goal.id, user_id: otherUserId, title: 'hacked' }),
    ).rejects.toBeInstanceOf(GoalNotFound)
    await expect(
      remove.execute({ id: goal.id, user_id: otherUserId }),
    ).rejects.toBeInstanceOf(GoalNotFound)

    expect(goalsRepository.items[0].title).toBe('Private')
  })

  it('allows a past deadline only when the goal is completed', async () => {
    const goal = await goalsRepository.create({
      title: 'Goal',
      deadline: new Date(Date.now() + DAY),
      user_id: ownerId,
    })
    const sut = new UpdateGoalUseCase(goalsRepository)
    const yesterday = new Date(Date.now() - DAY)

    await expect(
      sut.execute({ id: goal.id, user_id: ownerId, deadline: yesterday }),
    ).rejects.toBeInstanceOf(InvalidDeadline)

    const updated = await sut.execute({
      id: goal.id,
      user_id: ownerId,
      deadline: yesterday,
      isCompleted: true,
    })
    expect(updated.goal_status).toBe('completed')
  })

  it('returns goal details with subtasks and status', async () => {
    const goal = await goalsRepository.create({
      title: 'Goal',
      deadline: new Date(Date.now() + DAY),
      user_id: ownerId,
    })
    await subtasksRepository.create({ goal_id: goal.id, description: 'step' })

    const sut = new GetDetailsUseCase(goalsRepository, subtasksRepository)
    const details = await sut.execute({ id: goal.id, user_id: ownerId })

    expect(details.goal_status).toBe('active')
    expect(details.subtasks).toEqual([
      expect.objectContaining({ description: 'step', isCompleted: false }),
    ])
  })

  it('builds the dashboard summary', async () => {
    const goalA = await goalsRepository.create({
      title: 'A',
      deadline: new Date(Date.now() + DAY),
      user_id: ownerId,
    })
    const goalB = await goalsRepository.create({
      title: 'B',
      deadline: new Date(Date.now() + 30 * DAY),
      user_id: ownerId,
    })
    await goalsRepository.update(goalB.id, { isCompleted: true })
    const subtask = await subtasksRepository.create({
      goal_id: goalA.id,
      description: 's1',
    })
    await subtasksRepository.update(subtask.id, { isCompleted: true })
    await subtasksRepository.create({ goal_id: goalA.id, description: 's2' })

    const sut = new GetGoalsSummaryUseCase(goalsRepository, subtasksRepository)

    await expect(sut.execute({ user_id: ownerId })).resolves.toEqual({
      goals: { total: 2, active: 1, completed: 1, expired: 0, due_soon: 1 },
      subtasks: { total: 2, completed: 1 },
      completion_rate: 50,
    })
  })
})
