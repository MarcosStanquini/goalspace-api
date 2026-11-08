import { cn } from '@/shared/lib/utils'
import type { GoalStatus } from '../types'

const STATUS = {
  active: {
    label: 'No prazo',
    className: 'text-planet bg-[var(--planet-soft)]',
  },
  expired: {
    label: 'Vencida',
    className: 'text-urgent bg-[var(--urgent-soft)]',
  },
  completed: {
    label: 'Conquistada',
    className: 'text-amber-700 dark:text-achieved bg-[var(--achieved-soft)]',
  },
}

export function GoalStatusBadge({
  status,
  urgent = false,
}: {
  status: GoalStatus
  /** Ativa, mas vencendo em menos de 24 h */
  urgent?: boolean
}) {
  const { label, className } =
    status === 'active' && urgent
      ? { label: 'Urgente', className: STATUS.expired.className }
      : STATUS[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        className,
      )}
    >
      {label}
    </span>
  )
}
