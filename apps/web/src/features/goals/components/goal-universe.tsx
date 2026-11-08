import { useQuery } from '@tanstack/react-query'
import {
  HistoryIcon,
  InfoIcon,
  LayoutGridIcon,
  PlusIcon,
  Rotate3dIcon,
  RotateCcwIcon,
  ScanEyeIcon,
  SearchIcon,
} from 'lucide-react'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { useNow } from '@/shared/hooks/use-now'
import { formatShortDate, formatTimeLeft } from '@/shared/lib/format-time'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { goalsQueries } from '../queries'
import type { GoalListItem, GoalStatus } from '../types'
import { GoalFormDialog } from './goal-form-dialog'
import { GoalList } from './goal-list'
import { planetColor } from '../lib/solar'
import { OrbitLegend } from './orbit-legend'
import { GoalSheet } from './goal-sheet'
import { PlanetDot } from './planet-dot'
import { type CameraPreset, SolarSystem } from './solar-system'
import { SpaceBackdrop } from './space-backdrop'
import { TimeTravel } from './time-travel'

const DAY = 24 * 60 * 60 * 1000

const STATUS_FILTERS: { value: GoalStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'No prazo' },
  { value: 'expired', label: 'Vencidas' },
  { value: 'completed', label: 'Conquistadas' },
]

// Sem backdrop-blur: desfocar a cena 3D a cada quadro pesa muito
const glass =
  'border border-white/10 bg-[#0b0f22]/85 shadow-2xl shadow-black/40'

// Liga na hora e desliga com atraso: a cena só volta a animar depois que o
// painel terminou de sair
function useDelayedRelease(active: boolean, delay = 350) {
  const [held, setHeld] = useState(active)
  useEffect(() => {
    if (active) {
      setHeld(true)
      return
    }
    const timer = setTimeout(() => setHeld(false), delay)
    return () => clearTimeout(timer)
  }, [active, delay])
  return active || held
}

// Telas largas ganham o painel lateral de próximos prazos
function useWideScreen() {
  const [wide, setWide] = useState(
    () => window.matchMedia('(min-width: 1280px)').matches,
  )
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1280px)')
    const update = () => setWide(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return wide
}

function greeting(now: number) {
  const hour = new Date(now).getHours()
  if (hour < 5) return 'Boa madrugada'
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function DockButton({
  label,
  active,
  asChild,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  /** Para usar um link no lugar do botão */
  asChild?: boolean
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          asChild={asChild}
          aria-label={label}
          aria-pressed={asChild ? undefined : active}
          onClick={onClick}
          className={cn(
            'size-10 rounded-xl text-white/70 hover:bg-white/10 hover:text-white',
            active && 'bg-white/12 text-white',
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}

function UpcomingPanel({
  goals,
  now,
  onSelect,
}: {
  goals: GoalListItem[]
  now: number
  onSelect: (id: string) => void
}) {
  const upcoming = goals
    .filter((goal) => !goal.isCompleted)
    .sort((a, b) => Date.parse(a.deadline) - Date.parse(b.deadline))
    .slice(0, 5)

  if (upcoming.length === 0) return null

  return (
    <aside
      aria-labelledby="upcoming-title"
      className={cn('w-72 rounded-2xl p-3', glass)}
    >
      <h2
        id="upcoming-title"
        className="px-2 pt-1 pb-2 text-[11px] font-medium tracking-[0.14em] text-white/50 uppercase"
      >
        Próximos prazos
      </h2>
      <ul className="grid gap-0.5">
        {upcoming.map((goal) => {
          const urgent = Date.parse(goal.deadline) - now <= DAY
          const { total, completed } = goal.progress
          return (
            <li key={goal.id}>
              <button
                type="button"
                onClick={() => onSelect(goal.id)}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors outline-none hover:bg-white/8 focus-visible:bg-white/10"
              >
                <PlanetDot
                  color={planetColor(goal, urgent)}
                  className="size-3.5"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {goal.title}
                  </span>
                  {total > 0 && (
                    <span className="mt-1 block h-0.5 overflow-hidden rounded-full bg-white/10">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${(completed / total) * 100}%`,
                          background: planetColor(goal, urgent),
                        }}
                      />
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'shrink-0 font-mono text-[11px]',
                    urgent ? 'text-urgent' : 'text-white/50',
                  )}
                >
                  {formatTimeLeft(goal.deadline, now)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

function AllGoalsSheet({
  open,
  onOpenChange,
  goals,
  now,
  selectedId,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  goals: GoalListItem[]
  now: number
  selectedId?: string
  onSelect: (id: string) => void
}) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<GoalStatus | 'all'>('all')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return goals.filter(
      (goal) =>
        (status === 'all' || goal.goal_status === status) &&
        goal.title.toLowerCase().includes(term),
    )
  }, [goals, search, status])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-3xl">
        <SheetHeader className="pr-12">
          <SheetTitle className="text-xl tracking-tight">
            Todas as metas
          </SheetTitle>
          <SheetDescription>
            {goals.length} {goals.length === 1 ? 'meta' : 'metas'} na sua
            galáxia
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-5 px-4 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-48 flex-1">
              <SearchIcon className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar meta"
                aria-label="Buscar meta"
                className="pl-8"
              />
            </div>
            <ToggleGroup
              type="single"
              size="sm"
              variant="outline"
              value={status}
              onValueChange={(value) =>
                value && setStatus(value as GoalStatus | 'all')
              }
              aria-label="Filtrar por status"
              className="flex-wrap"
            >
              {STATUS_FILTERS.map((filter) => (
                <ToggleGroupItem key={filter.value} value={filter.value}>
                  {filter.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground rounded-2xl border border-dashed py-14 text-center text-sm">
              {goals.length === 0
                ? 'Nenhuma meta ainda. Crie a primeira.'
                : 'Nenhuma meta encontrada com esses filtros.'}
            </p>
          ) : (
            <GoalList
              goals={filtered}
              now={now}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export interface GoalUniverseProps {
  userName?: string
  selectedId?: string
  onSelect: (id?: string) => void
  listOpen: boolean
  onListOpenChange: (open: boolean) => void
  /** Botões do canto superior direito (conta, WhatsApp...) */
  actions?: ReactNode
  /** Aviso flutuante no canto inferior esquerdo */
  callout?: ReactNode
  /** Botões extras no fim da dock */
  dockExtra?: ReactNode
}

/**
 * Página principal em tela cheia: o universo das metas, com informações e
 * ações flutuando por cima.
 */
export function GoalUniverse({
  userName,
  selectedId,
  onSelect,
  listOpen,
  onListOpenChange,
  actions,
  callout,
  dockExtra,
}: GoalUniverseProps) {
  const now = useNow()
  const [creating, setCreating] = useState(false)
  const [travelOpen, setTravelOpen] = useState(false)
  const [travelDays, setTravelDays] = useState(0)
  const [preset, setPreset] = useState<CameraPreset>({
    view: 'perspective',
    nonce: 0,
  })
  const wide = useWideScreen()
  // Com painel ou modal por cima, a cena congela e libera a GPU para a animação
  const sceneCovered = useDelayedRelease(
    Boolean(selectedId) || listOpen || creating,
  )
  const { data: goals, isError, refetch } = useQuery(goalsQueries.list())
  const { data: summary } = useQuery(goalsQueries.summary())

  // O universo é sempre noturno; modais e painéis acompanham enquanto ele está aberto
  useEffect(() => {
    const root = document.documentElement
    const wasDark = root.classList.contains('dark')
    root.classList.add('dark')
    return () => {
      root.classList.toggle('dark', wasDark)
    }
  }, [])

  const stats = summary && [
    { label: 'vencem em 7 dias', value: summary.goals.due_soon },
    {
      label: summary.goals.expired === 1 ? 'vencida' : 'vencidas',
      value: summary.goals.expired,
      color: summary.goals.expired > 0 ? 'var(--urgent)' : undefined,
    },
    {
      label: summary.goals.completed === 1 ? 'conquistada' : 'conquistadas',
      value: summary.goals.completed,
      color: 'var(--achieved)',
    },
  ]

  return (
    <div className="dark text-foreground relative h-svh w-full overflow-hidden bg-[#04050c] [--orbit-stage:#0a0d1f]">
      <SpaceBackdrop />

      {goals && (
        <SolarSystem
          goals={goals}
          now={now}
          viewNow={now + travelDays * DAY}
          selectedId={selectedId}
          onSelect={onSelect}
          preset={preset}
          // Em telas largas o centro vai para a esquerda do painel de prazos
          offsetX={wide ? 160 : 0}
          paused={sceneCovered}
        />
      )}

      {/* Topo: saudação e números */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 p-4 sm:p-6">
        <div className="pointer-events-auto grid gap-1">
          <p className="text-sm text-white/55">
            {greeting(now)}
            {userName ? `, ${userName}` : ''}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {summary ? (
              <>
                {summary.goals.active}{' '}
                <span className="text-white/60">
                  {summary.goals.active === 1
                    ? 'meta em órbita'
                    : 'metas em órbita'}
                </span>
              </>
            ) : (
              'Sua galáxia'
            )}
          </h1>
          {stats && (
            <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/55">
              {stats.map((stat) => (
                <span key={stat.label} className="flex items-center gap-1.5">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: stat.color ?? 'var(--planet)' }}
                  />
                  <span className="font-mono text-white/85">{stat.value}</span>
                  {stat.label}
                </span>
              ))}
              {summary.completion_rate > 0 && (
                <span className="hidden items-center gap-1.5 sm:flex">
                  <span className="font-mono text-white/85">
                    {summary.completion_rate}%
                  </span>
                  de conclusão
                </span>
              )}
            </p>
          )}
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          {actions}
        </div>
      </header>

      {/* Viajando no tempo: aviso no topo para não esquecer */}
      {travelDays > 0 && (
        <div
          className={cn(
            'absolute top-28 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full px-3 py-1.5 text-xs sm:top-6',
            glass,
          )}
        >
          <HistoryIcon className="size-3.5 text-white/60" />
          Vendo {formatShortDate(now + travelDays * DAY)}
          <button
            type="button"
            onClick={() => setTravelDays(0)}
            className="text-primary ml-1 font-medium hover:underline"
          >
            voltar
          </button>
        </div>
      )}

      {goals && (
        <div className="absolute top-1/2 right-6 z-10 hidden -translate-y-1/2 xl:block">
          <UpcomingPanel goals={goals} now={now} onSelect={onSelect} />
        </div>
      )}

      {callout && (
        <div className="absolute bottom-6 left-6 z-10 hidden md:block">
          {callout}
        </div>
      )}

      {isError && (
        <div className="absolute inset-0 z-10 grid place-items-center p-4">
          <div className={cn('grid gap-3 rounded-2xl p-5 text-center', glass)}>
            <p className="text-sm">Não foi possível carregar suas metas.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      )}

      {goals?.length === 0 && (
        <div className="absolute inset-0 z-10 grid place-items-center p-4">
          <div
            className={cn(
              'grid max-w-xs justify-items-center gap-3 rounded-2xl p-6 text-center',
              glass,
            )}
          >
            <p className="text-lg font-semibold tracking-tight">
              Um universo esperando
            </p>
            <p className="text-sm text-white/60">
              Crie sua primeira meta e ela entra em órbita de acordo com o
              prazo.
            </p>
            <Button onClick={() => setCreating(true)}>
              <PlusIcon />
              Criar primeira meta
            </Button>
          </div>
        </div>
      )}

      <p className="pointer-events-none absolute right-6 bottom-7 z-10 hidden text-right text-[11px] text-white/35 lg:block">
        Botão direito + arrastar para girar
        <br />
        Roda do mouse para aproximar
      </p>

      {/* Dock */}
      <div className="absolute inset-x-0 bottom-4 z-20 flex flex-col items-center gap-3 px-4 sm:bottom-6">
        {travelOpen && goals && (
          <div
            className={cn('w-full max-w-md rounded-2xl px-4 pt-3 pb-4', glass)}
          >
            <TimeTravel
              days={travelDays}
              onChange={setTravelDays}
              goals={goals}
              now={now}
            />
          </div>
        )}
        <nav
          aria-label="Ações"
          className={cn('flex items-center gap-1 rounded-2xl p-1.5', glass)}
        >
          <Button
            onClick={() => setCreating(true)}
            className="h-10 rounded-xl px-4 shadow-lg shadow-indigo-500/25"
          >
            <PlusIcon />
            <span className="hidden sm:inline">Nova meta</span>
          </Button>
          <span className="mx-1 h-6 w-px bg-white/10" />
          <DockButton
            label="Todas as metas"
            active={listOpen}
            onClick={() => onListOpenChange(true)}
          >
            <LayoutGridIcon />
          </DockButton>
          <DockButton
            label={travelOpen ? 'Fechar viagem no tempo' : 'Viagem no tempo'}
            active={travelOpen}
            onClick={() => {
              if (travelOpen) setTravelDays(0)
              setTravelOpen(!travelOpen)
            }}
          >
            {travelOpen ? <RotateCcwIcon /> : <HistoryIcon />}
          </DockButton>
          <span className="mx-1 h-6 w-px bg-white/10" />
          <DockButton
            label="Vista em perspectiva"
            active={preset.view === 'perspective'}
            onClick={() =>
              setPreset((current) => ({
                view: 'perspective',
                nonce: current.nonce + 1,
              }))
            }
          >
            <Rotate3dIcon />
          </DockButton>
          <DockButton
            label="Vista de cima"
            active={preset.view === 'top'}
            onClick={() =>
              setPreset((current) => ({
                view: 'top',
                nonce: current.nonce + 1,
              }))
            }
          >
            <ScanEyeIcon />
          </DockButton>
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Como ler a carta"
                    className="size-10 rounded-xl text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    <InfoIcon />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">Como ler a carta</TooltipContent>
            </Tooltip>
            <PopoverContent side="top" className="w-72">
              <OrbitLegend />
            </PopoverContent>
          </Popover>
          {dockExtra}
        </nav>
      </div>

      <AllGoalsSheet
        open={listOpen}
        onOpenChange={onListOpenChange}
        goals={goals ?? []}
        now={now}
        selectedId={selectedId}
        onSelect={onSelect}
      />
      <GoalFormDialog
        open={creating}
        onOpenChange={setCreating}
        onCreated={onSelect}
      />
      <GoalSheet goalId={selectedId} onClose={() => onSelect(undefined)} />
    </div>
  )
}
