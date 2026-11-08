import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/shared/api/client'
import { Skeleton } from '@/shared/ui/skeleton'
import { Switch } from '@/shared/ui/switch'

interface NotificationSettings {
  remindBefore24h: boolean
  remindBefore1h: boolean
  achievementAlert: boolean
}

const QUERY_KEY = ['notification-settings']

// onGoalCompleted e weeklyReport ficam de fora: a API salva, mas nenhum job envia
const OPTIONS: {
  key: keyof NotificationSettings
  label: string
  description: string
}[] = [
  {
    key: 'remindBefore24h',
    label: 'Lembrete de 24 horas',
    description:
      'Todo dia à meia-noite, com as metas que vencem nas próximas 24 h.',
  },
  {
    key: 'remindBefore1h',
    label: 'Lembrete de 1 hora',
    description: 'A cada hora cheia, com as metas que vencem na hora seguinte.',
  },
  {
    key: 'achievementAlert',
    label: 'Resumo de conquistas',
    description: 'Às segundas, às 8h, com o total de metas concluídas.',
  },
]

export function NotificationsForm() {
  const queryClient = useQueryClient()
  const { data: settings } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => api.get<NotificationSettings>('/notificationSettings'),
  })

  const update = useMutation({
    mutationFn: (data: Partial<NotificationSettings>) =>
      api.patch<NotificationSettings>('/notificationSettings', data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueryData<NotificationSettings>(QUERY_KEY)
      if (previous) {
        queryClient.setQueryData(QUERY_KEY, { ...previous, ...data })
      }
      return { previous }
    },
    onError: (error, _data, context) => {
      queryClient.setQueryData(QUERY_KEY, context?.previous)
      toast.error(error.message)
    },
  })

  if (!settings) return <Skeleton className="h-40 w-full max-w-md" />

  return (
    <ul className="grid max-w-md gap-5">
      {OPTIONS.map((option) => (
        <li key={option.key} className="flex items-start justify-between gap-6">
          <label htmlFor={option.key} className="grid gap-0.5">
            <span className="text-sm font-medium">{option.label}</span>
            <span className="text-muted-foreground text-xs">
              {option.description}
            </span>
          </label>
          <Switch
            id={option.key}
            checked={settings[option.key]}
            onCheckedChange={(checked) =>
              update.mutate({ [option.key]: checked })
            }
          />
        </li>
      ))}
    </ul>
  )
}
