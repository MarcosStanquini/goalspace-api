import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { WhatsappPanel } from './whatsapp-panel'

export function WhatsappDialog({
  children,
  open,
  onOpenChange,
}: {
  children?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Lembretes no WhatsApp</DialogTitle>
          <DialogDescription>
            Conecte seu número uma vez e receba os avisos das suas metas.
          </DialogDescription>
        </DialogHeader>
        {/* Só monta o painel com o modal aberto: o QR não é gerado à toa */}
        <WhatsappPanel showSettingsLink />
      </DialogContent>
    </Dialog>
  )
}
