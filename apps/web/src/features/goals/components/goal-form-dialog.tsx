import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { toDateTimeLocal } from '@/shared/lib/format-time'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { useCreateGoal, useUpdateGoal } from '../queries'
import type { Goal } from '../types'

const DAY = 24 * 60 * 60 * 1000

const PRESETS = [
  { label: 'Amanhã', days: 1 },
  { label: '1 semana', days: 7 },
  { label: '1 mês', days: 30 },
  { label: '3 meses', days: 90 },
]

const goalFormSchema = z.object({
  title: z.string().trim().min(1, 'Dê um título à meta'),
  description: z.string(),
  deadline: z
    .string()
    .min(1, 'Escolha um prazo')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Data inválida'),
})

type GoalFormValues = z.infer<typeof goalFormSchema>

interface GoalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Quando informado, edita a meta em vez de criar */
  goal?: Goal
  onCreated?: (id: string) => void
}

export function GoalFormDialog({
  open,
  onOpenChange,
  goal,
  onCreated,
}: GoalFormDialogProps) {
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormValues>({ resolver: zodResolver(goalFormSchema) })

  useEffect(() => {
    if (open) {
      reset({
        title: goal?.title ?? '',
        description: goal?.description ?? '',
        deadline: goal ? toDateTimeLocal(goal.deadline) : '',
      })
    }
  }, [open, goal, reset])

  async function onSubmit(values: GoalFormValues) {
    const deadline = new Date(values.deadline).toISOString()
    const deadlineChanged =
      !goal || toDateTimeLocal(goal.deadline) !== values.deadline

    if (deadlineChanged && Date.parse(deadline) < Date.now()) {
      setError('deadline', { message: 'O prazo precisa estar no futuro' })
      return
    }

    if (goal) {
      await updateGoal.mutateAsync({
        id: goal.id,
        data: {
          title: values.title,
          description: values.description,
          // A API recusa prazo passado; só envia se o usuário mudou
          ...(deadlineChanged && { deadline }),
        },
      })
      toast.success('Meta atualizada')
    } else {
      const created = await createGoal.mutateAsync({
        title: values.title,
        description: values.description || undefined,
        deadline,
      })
      toast.success('Meta em órbita')
      onCreated?.(created.id)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{goal ? 'Editar meta' : 'Nova meta'}</DialogTitle>
          <DialogDescription>
            {goal
              ? 'Mudar o prazo muda a órbita da meta.'
              : 'O prazo define em que órbita ela vai entrar.'}
          </DialogDescription>
        </DialogHeader>

        <form
          // Erros da API já viram toast nas mutations
          onSubmit={(event) => handleSubmit(onSubmit)(event).catch(() => {})}
          className="grid gap-4"
          noValidate
        >
          <div className="grid gap-1.5">
            <Label htmlFor="goal-title">Título</Label>
            <Input
              id="goal-title"
              placeholder="Correr 10 km"
              aria-invalid={Boolean(errors.title)}
              {...register('title')}
            />
            {errors.title && (
              <p className="text-destructive text-xs">{errors.title.message}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="goal-description">
              Descrição{' '}
              <span className="text-muted-foreground font-normal">
                (opcional)
              </span>
            </Label>
            <Textarea
              id="goal-description"
              rows={3}
              placeholder="Por que essa meta importa?"
              {...register('description')}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="goal-deadline">Prazo</Label>
            <Input
              id="goal-deadline"
              type="datetime-local"
              aria-invalid={Boolean(errors.deadline)}
              {...register('deadline')}
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.days}
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() =>
                    setValue(
                      'deadline',
                      toDateTimeLocal(new Date(Date.now() + preset.days * DAY)),
                      { shouldValidate: true, shouldDirty: true },
                    )
                  }
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            {errors.deadline && (
              <p className="text-destructive text-xs">
                {errors.deadline.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando…' : goal ? 'Salvar' : 'Criar meta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
