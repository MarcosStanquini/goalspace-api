import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { app } from '@/app'

// Troca os repositórios Prisma e a Evolution API por versões em memória
// (uma instância compartilhada por classe), para testar a API sem banco/WhatsApp.
// O vi.mock é içado (hoisted) para antes dos imports.
vi.mock(
  '@/modules/users/repositories/prisma/prisma-users-repository',
  async () => {
    const { InMemoryUsersRepository } = await import(
      '@/modules/users/repositories/in-memory/in-memory-users-repository'
    )
    const shared = new InMemoryUsersRepository()
    return {
      PrismaUsersRepository: class {
        constructor() {
          return shared
        }
      },
    }
  },
)
vi.mock(
  '@/modules/goals/repositories/prisma/prisma-goals-repository',
  async () => {
    const { InMemoryGoalsRepository } = await import(
      '@/modules/goals/repositories/in-memory/in-memory-goals-repository'
    )
    const shared = new InMemoryGoalsRepository()
    return {
      PrismaGoalsRepository: class {
        constructor() {
          return shared
        }
      },
    }
  },
)
vi.mock(
  '@/modules/subtasks/repositories/prisma/prisma-subtask-repository',
  async () => {
    const { InMemorySubtaskRepository } = await import(
      '@/modules/subtasks/repositories/in-memory/in-memory-subtask-repository'
    )
    const shared = new InMemorySubtaskRepository()
    return {
      PrismaSubtaskRepository: class {
        constructor() {
          return shared
        }
      },
    }
  },
)
vi.mock(
  '@/modules/notification/repositories/prisma/prisma-notification-repository',
  async () => {
    const { InMemoryNotificationRepository } = await import(
      '@/modules/notification/repositories/in-memory/in-memory-notification-repository'
    )
    const shared = new InMemoryNotificationRepository()
    return {
      PrismaNotificationRepository: class {
        constructor() {
          return shared
        }
      },
    }
  },
)
vi.mock(
  '@/modules/instance/providers/evolution/evolution-whatsapp-provider',
  async () => {
    const { InMemoryWhatsappProvider } = await import(
      '@/modules/instance/providers/in-memory/in-memory-whatsapp-provider'
    )
    const shared = new InMemoryWhatsappProvider()
    return {
      EvolutionWhatsappProvider: class {
        constructor() {
          return shared
        }
      },
    }
  },
)

const futureDeadline = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  .toISOString()
  .replace(/\.\d{3}Z$/, 'Z')

async function registerAndLogin(name: string, email: string) {
  await app.inject({
    method: 'POST',
    url: '/users',
    payload: { name, email, password: '123456' },
  })
  const response = await app.inject({
    method: 'POST',
    url: '/sessions',
    payload: { email, password: '123456' },
  })
  return { authorization: `Bearer ${response.json().token}` }
}

describe('GoalSpace API (e2e)', () => {
  let alice: { authorization: string }
  let bob: { authorization: string }

  beforeAll(async () => {
    await app.ready()
    alice = await registerAndLogin('Alice', 'alice@example.com')
    bob = await registerAndLogin('Bob', 'bob@example.com')
  })

  afterAll(async () => {
    await app.close()
  })

  it('registers without leaking the password hash', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        name: 'Carol',
        email: 'carol@example.com',
        password: '123456',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      id: expect.any(String),
      email: 'carol@example.com',
      role: 'USER',
    })
    expect(response.json()).not.toHaveProperty('password_hash')
  })

  it('rejects requests without token', async () => {
    const response = await app.inject({ method: 'GET', url: '/goals' })
    expect(response.statusCode).toBe(401)
  })

  it('answers CORS preflight for the front', async () => {
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/goals',
      headers: {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'POST',
      },
    })
    expect(response.statusCode).toBe(204)
    expect(response.headers['access-control-allow-origin']).toBe(
      'http://localhost:5173',
    )
  })

  it('returns 400 (not 500) for invalid input', async () => {
    const invalidDeadline = await app.inject({
      method: 'POST',
      url: '/goals',
      headers: alice,
      payload: { title: 'x', deadline: '31/12/2030' },
    })
    expect(invalidDeadline.statusCode).toBe(400)

    const missingTitle = await app.inject({
      method: 'POST',
      url: '/goals',
      headers: alice,
      payload: { deadline: futureDeadline },
    })
    expect(missingTitle.statusCode).toBe(400)

    const malformedJson = await app.inject({
      method: 'POST',
      url: '/goals',
      headers: { ...alice, 'content-type': 'application/json' },
      payload: '{"title":',
    })
    expect(malformedJson.statusCode).toBe(400)
  })

  it('runs the full goal + subtask flow with all fields in the responses', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/goals',
      headers: alice,
      payload: { title: 'Run 10k', deadline: futureDeadline },
    })
    expect(created.statusCode).toBe(201)
    const goal = created.json()
    expect(goal).toMatchObject({
      id: expect.any(String),
      title: 'Run 10k',
      description: null,
      isCompleted: false,
      goal_status: 'active',
      created_at: expect.any(String),
    })
    expect(goal).not.toHaveProperty('user_id')

    const list = await app.inject({
      method: 'GET',
      url: '/goals?goal_status=active',
      headers: alice,
    })
    expect(list.statusCode).toBe(200)
    expect(list.json()).toEqual([
      expect.objectContaining({ id: goal.id, goal_status: 'active' }),
    ])

    const subtask = await app.inject({
      method: 'POST',
      url: `/goals/${goal.id}/subtasks`,
      headers: alice,
      payload: { description: 'Buy shoes' },
    })
    expect(subtask.statusCode).toBe(201)

    const toggled = await app.inject({
      method: 'PATCH',
      url: `/subtasks/${subtask.json().id}`,
      headers: alice,
      payload: { isCompleted: true },
    })
    expect(toggled.statusCode).toBe(200)
    expect(toggled.json()).toMatchObject({
      description: 'Buy shoes',
      isCompleted: true,
    })

    const details = await app.inject({
      method: 'GET',
      url: `/goals/${goal.id}`,
      headers: alice,
    })
    expect(details.json()).toMatchObject({
      goal_status: 'active',
      subtasks: [expect.objectContaining({ isCompleted: true })],
    })

    const completed = await app.inject({
      method: 'PATCH',
      url: `/goals/${goal.id}`,
      headers: alice,
      payload: { isCompleted: true },
    })
    expect(completed.json()).toMatchObject({ goal_status: 'completed' })

    const summary = await app.inject({
      method: 'GET',
      url: '/goals/summary',
      headers: alice,
    })
    expect(summary.json()).toEqual({
      goals: { total: 1, active: 0, completed: 1, expired: 0, due_soon: 0 },
      subtasks: { total: 1, completed: 1 },
      completion_rate: 100,
    })

    // Outro usuário não enxerga nem mexe na meta da Alice
    const bobReads = await app.inject({
      method: 'GET',
      url: `/goals/${goal.id}`,
      headers: bob,
    })
    expect(bobReads.statusCode).toBe(404)
    const bobDeletes = await app.inject({
      method: 'DELETE',
      url: `/goals/${goal.id}`,
      headers: bob,
    })
    expect(bobDeletes.statusCode).toBe(404)
    const bobEditsSubtask = await app.inject({
      method: 'PATCH',
      url: `/subtasks/${subtask.json().id}`,
      headers: bob,
      payload: { isCompleted: false },
    })
    expect(bobEditsSubtask.statusCode).toBe(404)

    const deleted = await app.inject({
      method: 'DELETE',
      url: `/goals/${goal.id}`,
      headers: alice,
    })
    expect(deleted.statusCode).toBe(204)

    const afterDelete = await app.inject({
      method: 'GET',
      url: '/goals',
      headers: alice,
    })
    expect(afterDelete.statusCode).toBe(200)
    expect(afterDelete.json()).toEqual([])
  })

  it('returns the profile and blocks duplicated e-mails', async () => {
    const me = await app.inject({
      method: 'GET',
      url: '/users/me',
      headers: alice,
    })
    expect(me.json()).toMatchObject({ name: 'Alice', instanceName: null })

    const conflict = await app.inject({
      method: 'PATCH',
      url: '/users',
      headers: alice,
      payload: { email: 'bob@example.com' },
    })
    expect(conflict.statusCode).toBe(409)

    const renamed = await app.inject({
      method: 'PATCH',
      url: '/users',
      headers: alice,
      payload: { name: 'Alice Doe' },
    })
    expect(renamed.json()).toMatchObject({ name: 'Alice Doe' })
  })

  it('reads and updates notification settings', async () => {
    const initial = await app.inject({
      method: 'GET',
      url: '/notificationSettings',
      headers: alice,
    })
    expect(initial.json()).toEqual({
      remindBefore24h: false,
      remindBefore1h: false,
      onGoalCompleted: false,
      weeklyReport: false,
      achievementAlert: false,
    })

    const updated = await app.inject({
      method: 'PATCH',
      url: '/notificationSettings',
      headers: alice,
      payload: { remindBefore1h: true },
    })
    expect(updated.statusCode).toBe(200)
    expect(updated.json()).toMatchObject({
      remindBefore1h: true,
      remindBefore24h: false,
    })
  })

  it('exports the PDF even without goals', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users/export',
      headers: bob,
    })
    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toBe('application/pdf')
    expect(response.rawPayload.subarray(0, 4).toString()).toBe('%PDF')
  })

  it('handles the WhatsApp connection flow', async () => {
    const before = await app.inject({
      method: 'GET',
      url: '/instance/status',
      headers: bob,
    })
    expect(before.json()).toMatchObject({ state: 'not_created' })

    const connect = await app.inject({
      method: 'POST',
      url: '/instance/connect',
      headers: bob,
    })
    expect(connect.statusCode).toBe(200)
    expect(connect.json()).toMatchObject({
      instanceName: expect.stringMatching(/^goalspace_/),
      qrCode: expect.any(String),
      connected: false,
    })

    const sendBeforeScan = await app.inject({
      method: 'POST',
      url: '/message/sendMessage',
      headers: bob,
      payload: { message: 'hello' },
    })
    expect(sendBeforeScan.statusCode).toBe(409)
  })

  it('serves the swagger spec', async () => {
    const response = await app.inject({ method: 'GET', url: '/docs/json' })
    expect(response.statusCode).toBe(200)
    expect(Object.keys(response.json().paths)).toEqual(
      expect.arrayContaining([
        '/goals/summary',
        '/users/me',
        '/instance/status',
      ]),
    )
  })
})
