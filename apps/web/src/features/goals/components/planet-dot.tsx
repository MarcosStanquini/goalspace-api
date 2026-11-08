import { cn } from '@/shared/lib/utils'

// A mesma esfera da carta, em CSS, para usar fora do SVG
export function PlanetDot({
  color,
  className,
}: {
  color: string
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block shrink-0 rounded-full', className)}
      style={{
        background: `radial-gradient(circle at 36% 30%, color-mix(in oklch, ${color}, white 58%), ${color} 42%, color-mix(in oklch, ${color}, black 52%))`,
        boxShadow: `0 0 0 4px color-mix(in oklch, ${color} 14%, transparent), 0 4px 14px -4px ${color}`,
      }}
    />
  )
}
