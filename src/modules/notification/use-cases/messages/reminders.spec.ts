import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryGoalsRepository } from '@/modules/goals/repositories/in-memory/in-memory-goals-repository'
import { InMemoryUsersRepository } from '@/modules/users/repositories/in-memory/in-memory-users-repository'
import { InMemoryNotificationRepository } from '../../repositories/in-memory/in-memory-notification-repository'
import { ReminderBefore24hUseCase } from './reminder-before-24h'
import { AchievementAlertUseCase } from './achievement-alert'

const HOUR = 60 * 60 * 1000

let usersRepository: InMemoryUsersRepository
let goalsRepository: InMemoryGoalsRepository
let notificationRepository: InMemoryNotificationRepository
let userId: string

describe('Notification messages', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository()
    goalsRepository = new InMemoryGoalsRepository()
    notificationRepository = new InMemoryNotificationRepository()

    const user = await usersRepository.create({
      name: 'John',
      email: 'john@example.com',
      password_hash: 'x',
    })
    userId = user.id
  })

  it('returns [] instead of throwing when the user has no goals', async () => {
    await notificationRepository.upsert(userId, {
      remindBefore24h: true,
      achievementAlert: true,
    })

    const reminder = new ReminderBefore24hUseCase(
      notificationRepository,
      usersRepository,
      goalsRepository,
    )
    const achievement = new AchievementAlertUseCase(
      usersRepository,
      goalsRepository,
      notificationRepository,
    )

    await expect(reminder.execute(userId)).resolves.toEqual([])
    await expect(achievement.execute(userId)).resolves.toEqual([])
  })

  it('only reminds about open goals inside the window', async () => {
    await notificationRepository.upsert(userId, { remindBefore24h: true })

    await goalsRepository.create({
      title: 'Soon',
      deadline: new Date(Date.now() + 2 * HOUR),
      user_id: userId,
    })
    const done = await goalsRepository.create({
      title: 'Already done',
      deadline: new Date(Date.now() + 3 * HOUR),
      user_id: userId,
    })
    await goalsRepository.update(done.id, { isCompleted: true })
    await goalsRepository.create({
      title: 'Far away',
      deadline: new Date(Date.now() + 48 * HOUR),
      user_id: userId,
    })

    const sut = new ReminderBefore24hUseCase(
      notificationRepository,
      usersRepository,
      goalsRepository,
    )
    const reminders = await sut.execute(userId)

    expect(reminders).toHaveLength(1)
    expect(reminders[0].message).toContain('Soon')
    expect(reminders[0].message).not.toContain('Already done')
    expect(reminders[0].message).not.toContain('Far away')
  })

  it('respects disabled settings', async () => {
    await goalsRepository.create({
      title: 'Soon',
      deadline: new Date(Date.now() + HOUR),
      user_id: userId,
    })

    const sut = new ReminderBefore24hUseCase(
      notificationRepository,
      usersRepository,
      goalsRepository,
    )

    await expect(sut.execute(userId)).resolves.toEqual([])
  })
})
