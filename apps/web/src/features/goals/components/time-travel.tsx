import { RotateCcwIcon } from 'lucide-react'
import { formatShortDate } from '@/shared/lib/format-time'
import { Button } from '@/shared/ui/button'
import { Slider } from '@/shared/ui/slider'
import type { GoalListItem } from '../types'

const DAY = 24 * 60 * 60 * 1000
const MAX_DAYS = 90

interface TimeTravelProps {
  days: number
  onChange: (days: number) => void
  goals: GoalListItem[]
  now: number
}

// Avança a carta no tempo para mostrar o que vai vencer se nada mudar
export function TimeTravel({ days, onChange, goals, now }: TimeTravelProps) {
  const target = now + days * DAY
  const newlyLate = goals.filter((goal) => {
    const deadline = Date.parse(goal.deadline)
    return !goal.isCompleted && deadline >= now && deadline < target
  }).length

  return (
    <div className="grid gap-2">
      <div className="flex min-h-8 items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs" aria-live="polite">
          {days === 0 ? (
            'Arraste para ver o futuro da sua carta'
          ) : (
            <>
              Em{' '}
              <span className="text-foreground font-mono">
                {formatShortDate(target)}
              </span>
              {newlyLate === 0 ? (
                ', nenhuma meta nova terá vencido'
              ) : (
                <>
                  ,{' '}
                  <span className="text-urgent font-medium">
                    {newlyLate} {newlyLate === 1 ? 'meta terá' : 'metas terão'}{' '}
                    vencido
                  </span>
                </>
              )}
            </>
          )}
        </p>
        {days > 0 && (
          <Button variant="ghost" size="xs" onClick={() => onChange(0)}>
            <RotateCcwIcon />
            Hoje
          </Button>
        )}
      </div>
      <Slider
        aria-label="Avançar no tempo"
        min={0}
        max={MAX_DAYS}
        step={1}
        value={[days]}
        onValueChange={([value]) => onChange(value)}
      />
      <div className="text-muted-foreground flex justify-between font-mono text-[10px]">
        <span>hoje</span>
        <span>+30d</span>
        <span>+60d</span>
        <span>+90d</span>
      </div>
    </div>
  )
}
