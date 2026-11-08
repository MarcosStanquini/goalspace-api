import { MessageCircleIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { useWhatsappStatus } from '../api'
import { WhatsappDialog } from './whatsapp-dialog'

const DISMISS_KEY = 'goalspace.whatsapp-banner-dismissed'

function readDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

// Aviso compacto, em vidro, para flutuar sobre o universo
export function WhatsappCallout() {
  const [dismissed, setDismissed] = useState(readDismissed)
  const { data: status } = useWhatsappStatus()

  if (dismissed || !status || status.connected) return null

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // Sem armazenamento, some só até recarregar
    }
    setDismissed(true)
  }

  return (
    <section
      aria-labelledby="whatsapp-callout-title"
      className="relative w-72 overflow-hidden rounded-2xl border border-emerald-400/20 bg-[#0d1124]/60 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -left-10 size-40 rounded-full bg-emerald-500/25 blur-3xl"
      />
      <div className="relative flex gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
          <MessageCircleIcon className="size-4.5" />
        </span>
        <div className="grid gap-1 pr-5">
          <h2 id="whatsapp-callout-title" className="text-sm font-semibold">
            Lembretes no WhatsApp
          </h2>
          <p className="text-xs leading-relaxed text-white/60">
            Receba um aviso 24 h e 1 h antes de cada prazo.
          </p>
        </div>
      </div>
      <WhatsappDialog>
        <Button
          size="sm"
          className="relative mt-3 w-full bg-emerald-600 text-white hover:bg-emerald-600/90"
        >
          Conectar agora
        </Button>
      </WhatsappDialog>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Fechar aviso do WhatsApp"
        className="absolute top-2 right-2 text-white/50 hover:text-white"
        onClick={dismiss}
      >
        <XIcon />
      </Button>
    </section>
  )
}
