import { MessageCircleIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { useWhatsappStatus } from '../api'
import { WhatsappDialog } from './whatsapp-dialog'

// Sempre visível no cabeçalho: mostra o estado e abre a conexão
export function WhatsappHeaderButton() {
  const { data: status, isError } = useWhatsappStatus()

  if (isError || !status) return null

  const connected = status.connected

  return (
    <WhatsappDialog>
      <Button
        variant="outline"
        size="sm"
        aria-label={
          connected ? 'WhatsApp conectado' : 'Conectar WhatsApp para lembretes'
        }
        className={cn(
          'gap-2 rounded-full',
          !connected &&
            'border-emerald-500/40 text-emerald-700 hover:text-emerald-700 dark:text-emerald-400',
        )}
      >
        <span className="relative flex size-2">
          {!connected && (
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          )}
          <span
            className={cn(
              'relative inline-flex size-2 rounded-full',
              connected ? 'bg-emerald-500' : 'bg-emerald-500/80',
            )}
          />
        </span>
        <MessageCircleIcon className="sm:hidden" />
        <span className="hidden sm:inline">
          {connected ? 'WhatsApp' : 'Conectar WhatsApp'}
        </span>
      </Button>
    </WhatsappDialog>
  )
}
