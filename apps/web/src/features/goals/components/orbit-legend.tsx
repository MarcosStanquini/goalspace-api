import { cn } from '@/shared/lib/utils'

const sphere = (light: string, dark: string) =>
  `radial-gradient(circle at 34% 30%, white, ${light} 28%, ${dark})`

export function OrbitLegend({ className }: { className?: string }) {
  return (
    <ul className={cn('grid gap-2.5 text-sm', className)}>
      <li className="flex items-center gap-2.5">
        <span
          className="size-3 rounded-full"
          style={{ background: sphere('#9fc0ff', '#2f4fc4') }}
        />
        Meta no prazo (cada uma tem sua cor)
      </li>
      <li className="flex items-center gap-2.5">
        <span
          className="size-3 rounded-full"
          style={{ background: sphere('#ffbf94', '#c2381f') }}
        />
        Menos de 24 h ou vencida
      </li>
      <li className="flex items-center gap-2.5">
        <span className="w-3 text-center text-amber-300">✦</span>
        Meta conquistada
      </li>
      <li className="flex items-center gap-2.5">
        <span className="h-1.5 w-3 -rotate-12 rounded-[50%] border border-white/60" />
        Anel = subtarefas concluídas
      </li>
      <li className="text-muted-foreground grid gap-1 border-t pt-2.5 text-xs">
        <span>
          Quanto mais perto do sol, mais perto do prazo. Vencidas caem no anel
          coral.
        </span>
        <span>
          Botão direito + arrastar gira a câmera; a roda do mouse aproxima.
        </span>
      </li>
    </ul>
  )
}
