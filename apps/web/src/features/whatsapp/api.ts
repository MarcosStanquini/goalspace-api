import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/shared/api/client'

export interface WhatsappStatus {
  instanceName: string | null
  state: 'not_created' | 'open' | 'connecting' | 'close'
  connected: boolean
  ownerNumber: string | null
}

const STATUS_KEY = ['whatsapp-status']

export function formatWhatsappNumber(ownerNumber: string | null) {
  if (!ownerNumber) return 'seu número'
  const digits = ownerNumber.split('@')[0]
  // 5511999998888 → +55 11 99999-8888
  const match = digits.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/)
  return match
    ? `+${match[1]} ${match[2]} ${match[3]}-${match[4]}`
    : `+${digits}`
}

export function useWhatsappStatus({ polling = false } = {}) {
  return useQuery({
    queryKey: STATUS_KEY,
    queryFn: () => api.get<WhatsappStatus>('/instance/status'),
    // Enquanto o QR Code está na tela, acompanha a leitura
    refetchInterval: (query) =>
      polling && !query.state.data?.connected ? 2500 : false,
    retry: false,
  })
}

export function useWhatsappActions() {
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries({ queryKey: STATUS_KEY })

  const connect = useMutation({
    mutationFn: () =>
      api.post<{ qrCode: string | null; connected: boolean }>(
        '/instance/connect',
      ),
    onSuccess: refresh,
    onError: (error) => toast.error(error.message),
  })

  const disconnect = useMutation({
    mutationFn: () => api.delete('/instance/logout'),
    onSuccess: () => {
      refresh()
      toast.success('WhatsApp desconectado')
    },
    onError: (error) => toast.error(error.message),
  })

  const sendTest = useMutation({
    mutationFn: () =>
      api.post('/message/sendMessage', {
        message:
          '✅ GoalSpace conectado! Seus lembretes de metas vão chegar por aqui.',
      }),
    onSuccess: () => toast.success('Mensagem de teste enviada'),
    onError: (error) => toast.error(error.message),
  })

  return { connect, disconnect, sendTest }
}
