import { CalendarIcon } from 'lucide-react'
import {
  formatDateTime,
  formatShortDate,
  formatTimeLeft,
} from '@/shared/lib/format-time'
import { cn } from '@/shared/lib/utils'
import { planetColor } from '../lib/solar'
import type { GoalListItem } from '../types'
import { GoalStatusBadge } from './goal-status-badge'
import { PlanetDot } from './planet-dot'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

function goalColor(goal: GoalListItem, now: number) {
  if (goal.isCompleted) return 'var(--achieved)'
  return planetColor(goal, Date.parse(goal.deadline) - now <= DAY)
}

export function GoalCard({
  goal,
  now,
  selected,
  onSelect,
}: {
  goal: GoalListItem
  now: number
  selected?: boolean
  onSelect: (id: string) => void
}) {
  const color = goalColor(goal, now)
  const { total, completed } = goal.progress
  const ratio = total === 0 ? 0 : completed / total
  const urgent = !goal.isCompleted && Date.parse(goal.deadline) - now <= DAY

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(goal.id)}
        className={cn(
          'group bg-card focus-visible:ring-ring/50 relative flex h-full w-full flex-col gap-4 overflow-hidden rounded-xl border p-4 text-left shadow-xs transition-all duration-200 outline-none hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 focus-visible:ring-[3px] dark:hover:shadow-black/30',
          selected && 'border-primary/60',
          urgent && 'border-urgent/35',
        )}
      >
        {/* Brilho da cor da meta no canto, como luz de um planeta próximo */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full opacity-40 blur-2xl transition-opacity duration-300 group-hover:opacity-70"
          style={{ background: color }}
        />

        <div className="relative flex items-start justify-between gap-3">
          {goal.isCompleted ? (
            <span className="text-achieved text-xl leading-none">✦</span>
          ) : (
            <PlanetDot color={color} className="size-5" />
          )}
          <GoalStatusBadge status={goal.goal_status} urgent={urgent} />
        </div>

        <div className="relative grid gap-1">
          <h3
            className={cn(
              'line-clamp-2 font-semibold tracking-tight',
              goal.isCompleted && 'text-muted-foreground',
            )}
          >
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {goal.description}
            </p>
          )}
        </div>

        <div className="relative mt-auto grid gap-3">
          <div className="flex items-end justify-between gap-2">
            <span
              className={cn(
                'font-mono text-lg leading-none tracking-tight tabular-nums',
                urgent && 'text-urgent',
                goal.isCompleted && 'text-muted-foreground text-sm',
              )}
            >
              {goal.isCompleted
                ? `prazo ${formatShortDate(goal.deadline)}`
                : formatTimeLeft(goal.deadline, now)}
            </span>
            {!goal.isCompleted && (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <CalendarIcon className="size-3" />
                {formatDateTime(goal.deadline)}
              </span>
            )}
          </div>

          {total > 0 ? (
            <div className="grid gap-1.5">
              <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${ratio * 100}%`, background: color }}
                />
              </div>
              <span className="text-muted-foreground text-xs">
                {completed} de {total}{' '}
                {total === 1 ? 'subtarefa' : 'subtarefas'}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">
              Sem subtarefas
            </span>
          )}
        </div>
      </button>
    </li>
  )
}

const GROUPS = [
  { title: 'Vencidas', test: (ms: number) => ms < 0 },
  { title: 'Próximas 24 horas', test: (ms: number) => ms <= DAY },
  { title: 'Esta semana', test: (ms: number) => ms <= 7 * DAY },
  { title: 'Este mês', test: (ms: number) => ms <= 30 * DAY },
  { title: 'Mais adiante', test: () => true },
]

export function groupGoals(goals: GoalListItem[], now: number) {
  const open = goals
    .filter((goal) => !goal.isCompleted)
    .sort((a, b) => Date.parse(a.deadline) - Date.parse(b.deadline))
  const groups: { title: string; goals: GoalListItem[] }[] = GROUPS.map(
    (group) => ({ title: group.title, goals: [] }),
  )

  for (const goal of open) {
    const left = Date.parse(goal.deadline) - now
    const index = GROUPS.findIndex((group) => group.test(left))
    groups[index].goals.push(goal)
  }

  groups.push({
    title: 'Conquistadas',
    goals: goals.filter((goal) => goal.isCompleted),
  })

  return groups.filter((group) => group.goals.length > 0)
}

export function GoalCardGrid({
  goals,
  now,
  selectedId,
  onSelect,
}: {
  goals: GoalListItem[]
  now: number
  selectedId?: string
  onSelect: (id: string) => void
}) {
  return (
    <ul className="grid gap-3 @lg:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          now={now}
          selected={goal.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  )
}

export function GoalList({
  goals,
  now,
  selectedId,
  onSelect,
}: {
  goals: GoalListItem[]
  now: number
  selectedId?: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="@container grid gap-8">
      {groupGoals(goals, now).map((group) => (
        <section key={group.title} aria-label={group.title}>
          <h3 className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-medium">
            {group.title}
            <span className="bg-muted rounded-full px-2 py-0.5 font-mono text-xs">
              {group.goals.length}
            </span>
          </h3>
          <GoalCardGrid
            goals={group.goals}
            now={now}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        </section>
      ))}
    </div>
  )
}
