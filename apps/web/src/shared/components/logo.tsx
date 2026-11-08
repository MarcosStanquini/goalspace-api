import { cn } from '@/shared/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-semibold tracking-tight',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <circle
          cx="12"
          cy="12"
          r="9.25"
          fill="none"
          stroke="var(--orbit-label)"
          strokeWidth="1"
        />
        <circle cx="12" cy="12" r="3.25" fill="var(--sun)" />
        <circle cx="18.5" cy="5.5" r="2.5" fill="var(--planet)" />
      </svg>
      GoalSpace
    </span>
  )
}
