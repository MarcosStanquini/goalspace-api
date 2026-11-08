import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CalendarClockIcon,
  CheckIcon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  Trash2Icon,
} from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { useNow } from '@/shared/hooks/use-now'
import { formatDateTime, formatTimeLeft } from '@/shared/lib/format-time'
import { cn } from '@/shared/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  goalsQueries,
  useCreateSubtask,
  useDeleteGoal,
  useRemoveSubtask,
  useToggleSubtask,
  useUpdateGoal,
} from '../queries'
import type { GoalDetails } from '../types'
import { GoalFormDialog } from './goal-form-dialog'
import { GoalStatusBadge } from './goal-status-badge'

function SubtaskList({ goal }: { goal: GoalDetails }) {
  const [description, setDescription] = useState('')
  const createSubtask = useCreateSubtask(goal.id)
  const toggleSubtask = useToggleSubtask(goal.id)
  const removeSubtask = useRemoveSubtask()

  const total = goal.subtasks.length
  const completed = goal.subtasks.filter((item) => item.isCompleted).length

  function handleAdd(event: FormEvent) {
    event.preventDefault()
    const value = description.trim()
    if (!value) return
    createSubtask.mutate(value, { onSuccess: () => setDescription('') })
  }

  return (
    <section aria-labelledby="subtasks-title" className="grid gap-3">
      <div className="flex items-baseline justify-between">
        <h3 id="subtasks-title" className="text-sm font-medium">
          Subtarefas
        </h3>
        <span className="text-muted-foreground font-mono text-xs">
          {completed}/{total}
        </span>
      </div>

      {total > 0 && (
        <div className="bg-muted h-1 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-[width] duration-500"
            style={{ width: `${(completed / total) * 100}%` }}
          />
        </div>
      )}

      <ul className="grid gap-0.5">
        {goal.subtasks.map((subtask) => (
          <li
            key={subtask.id}
            className="group hover:bg-muted/60 -mx-2 flex items-center gap-2.5 rounded-md px-2 py-1"
          >
            <Checkbox
              id={subtask.id}
              checked={subtask.isCompleted}
              onCheckedChange={(checked) =>
                toggleSubtask.mutate({
                  id: subtask.id,
                  isCompleted: checked === true,
                })
              }
            />
            <label
              htmlFor={subtask.id}
              className={cn(
                'min-w-0 flex-1 cursor-pointer text-sm break-words',
                subtask.isCompleted && 'text-muted-foreground line-through',
              )}
            >
              {subtask.description}
            </label>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Excluir ${subtask.description}`}
              className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100"
              onClick={() => removeSubtask.mutate(subtask.id)}
            >
              <Trash2Icon />
            </Button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Adicionar subtarefa"
          aria-label="Nova subtarefa"
        />
        <Button
          type="submit"
          variant="secondary"
          size="icon"
          aria-label="Adicionar"
          disabled={createSubtask.isPending}
        >
          <PlusIcon />
        </Button>
      </form>
    </section>
  )
}

interface GoalSheetProps {
  goalId?: string
  onClose: () => void
}

export function GoalSheet({ goalId, onClose }: GoalSheetProps) {
  const now = useNow()
  const [editing, setEditing] = useState(false)
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()
  const queryClient = useQueryClient()
  const {
    data: goal,
    isError,
    isPlaceholderData,
  } = useQuery({
    ...goalsQueries.details(goalId ?? ''),
    enabled: Boolean(goalId),
    // Abre já com o que a lista sabe (título, prazo, status): o painel não
    // troca de esqueleto para conteúdo no meio da animação
    placeholderData: () => {
      const item = queryClient
        .getQueryData(goalsQueries.list().queryKey)
        ?.find((listed) => listed.id === goalId)
      return item ? { ...item, subtasks: [] } : undefined
    },
  })

  function toggleCompleted() {
    if (!goal) return
    const isCompleted = !goal.isCompleted
    updateGoal.mutate(
      { id: goal.id, data: { isCompleted } },
      {
        onSuccess: () =>
          toast.success(
            isCompleted
              ? 'Meta conquistada. Mais uma estrela.'
              : 'Meta reaberta',
          ),
      },
    )
  }

  function handleDelete() {
    if (!goal) return
    deleteGoal.mutate(goal.id, {
      onSuccess: () => {
        toast.success('Meta excluída')
        onClose()
      },
    })
  }

  return (
    <>
      <Sheet open={Boolean(goalId)} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
          {isError ? (
            <SheetHeader>
              <SheetTitle>Meta não encontrada</SheetTitle>
              <SheetDescription>Ela pode ter sido excluída.</SheetDescription>
            </SheetHeader>
          ) : !goal ? (
            <div className="grid gap-3 p-4">
              <SheetTitle className="sr-only">Carregando meta</SheetTitle>
              <SheetDescription className="sr-only">Aguarde</SheetDescription>
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="mt-4 h-24 w-full" />
            </div>
          ) : (
            <>
              <SheetHeader className="gap-2 pr-10">
                <div>
                  <GoalStatusBadge status={goal.goal_status} />
                </div>
                <SheetTitle className="text-xl leading-tight font-semibold tracking-tight">
                  {goal.title}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-1.5 font-mono text-xs">
                  <CalendarClockIcon className="size-3.5" />
                  {formatDateTime(goal.deadline)} ·{' '}
                  {formatTimeLeft(goal.deadline, now)}
                </SheetDescription>
              </SheetHeader>

              <div className="grid gap-6 px-4 pb-4">
                {goal.description && (
                  <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                    {goal.description}
                  </p>
                )}

                {isPlaceholderData ? (
                  <div className="grid gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : (
                  <SubtaskList goal={goal} />
                )}

                <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                  <Button
                    onClick={toggleCompleted}
                    disabled={updateGoal.isPending}
                    variant={goal.isCompleted ? 'outline' : 'default'}
                  >
                    {goal.isCompleted ? <RotateCcwIcon /> : <CheckIcon />}
                    {goal.isCompleted ? 'Reabrir' : 'Concluir meta'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(true)}>
                    <PencilIcon />
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto"
                        aria-label="Excluir meta"
                      >
                        <Trash2Icon />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir esta meta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          “{goal.title}” e as subtarefas dela serão apagadas.
                          Não dá para desfazer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <GoalFormDialog open={editing} onOpenChange={setEditing} goal={goal} />
    </>
  )
}
