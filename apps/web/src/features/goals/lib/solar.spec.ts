import { describe, expect, it } from 'vitest'
import type { GoalListItem } from '../types'
import {
  layoutSolar,
  orbitalSpeed,
  planetPalette,
  radiusForHours,
  SOLAR,
  starDirection,
} from './solar'

const HOUR = 60 * 60 * 1000
const NOW = Date.UTC(2030, 0, 1)

function makeGoal(
  id: string,
  hoursFromNow: number,
  isCompleted = false,
  subtasks = 0,
): GoalListItem {
  return {
    id,
    title: id,
    description: null,
    deadline: new Date(NOW + hoursFromNow * HOUR).toISOString(),
    created_at: new Date(NOW).toISOString(),
    isCompleted,
    goal_status: 'active',
    progress: { total: subtasks, completed: 0 },
  }
}

describe('radiusForHours', () => {
  it('moves closer to the sun as the deadline approaches', () => {
    expect(radiusForHours(1)).toBeLessThan(radiusForHours(24))
    expect(radiusForHours(24)).toBeLessThan(radiusForHours(24 * 30))
  })

  it('stays between the inner and outer orbits', () => {
    expect(radiusForHours(-5)).toBe(SOLAR.innerRadius)
    expect(radiusForHours(24 * 10_000)).toBe(SOLAR.outerRadius)
  })
})

describe('orbitalSpeed', () => {
  it('is slower for distant orbits, like Kepler', () => {
    expect(orbitalSpeed(SOLAR.outerRadius)).toBeLessThan(
      orbitalSpeed(SOLAR.innerRadius),
    )
    expect(orbitalSpeed(SOLAR.innerRadius)).toBeCloseTo(
      (Math.PI * 2) / SOLAR.innerPeriod,
    )
  })
})

describe('layoutSolar', () => {
  const goals = [
    makeGoal('soon', 5, false, 3),
    makeGoal('later', 24 * 20),
    makeGoal('late', -3),
    makeGoal('done', 24, true),
  ]

  it('separates planets, fallen goals and achievements', () => {
    const { bodies, achieved } = layoutSolar(goals, NOW)

    expect(bodies.find((b) => b.goal.id === 'soon')).toMatchObject({
      kind: 'planet',
      urgent: true,
      rank: 0,
    })
    expect(bodies.find((b) => b.goal.id === 'later')).toMatchObject({
      kind: 'planet',
      urgent: false,
      rank: 1,
    })
    expect(bodies.find((b) => b.goal.id === 'late')).toMatchObject({
      kind: 'fallen',
      radius: SOLAR.horizonRadius,
    })
    expect(achieved.map((goal) => goal.id)).toEqual(['done'])
  })

  it('gives bigger planets to goals with more subtasks', () => {
    const { bodies } = layoutSolar(goals, NOW)
    const soon = bodies.find((b) => b.goal.id === 'soon')!
    const later = bodies.find((b) => b.goal.id === 'later')!

    expect(soon.size).toBeGreaterThan(later.size)
  })

  it('lets goals fall when time is advanced', () => {
    const { bodies } = layoutSolar(goals, NOW + 24 * HOUR)

    expect(bodies.find((b) => b.goal.id === 'soon')?.kind).toBe('fallen')
  })

  it('keeps the phase stable for the same goal', () => {
    const first = layoutSolar(goals, NOW).bodies[0].phase
    const second = layoutSolar([...goals].reverse(), NOW).bodies[0].phase

    expect(first).toBe(second)
  })
})

describe('planetPalette', () => {
  it('uses warm colors for urgent goals', () => {
    const goal = makeGoal('x', 2)
    expect(['#ffbf94', '#ffd27f']).toContain(planetPalette(goal, true).light)
  })
})

describe('starDirection', () => {
  it('places achievements above the orbital plane', () => {
    for (const id of ['a', 'b', 'c', 'd']) {
      const [x, y, z] = starDirection(id)
      expect(y).toBeGreaterThan(0)
      expect(Math.hypot(x, y, z)).toBeCloseTo(1)
    }
  })
})
