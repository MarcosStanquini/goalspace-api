import { Link } from '@tanstack/react-router'
import {
  BellRingIcon,
  CheckIcon,
  Loader2Icon,
  QrCodeIcon,
  RefreshCwIcon,
  SendIcon,
  TimerIcon,
  TrophyIcon,
  UnplugIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  formatWhatsappNumber,
  useWhatsappActions,
  useWhatsappStatus,
} from '../api'

// A Evolution expira o QR Code em cerca de 45 s; renova um pouco antes
const QR_REFRESH_MS = 40_000

const STEPS = ['Gerar código', 'Escanear', 'Pronto']

const BENEFITS = [
  { icon: BellRingIcon, text: 'Aviso 24 horas antes de cada prazo' },
  { icon: TimerIcon, text: 'Último lembrete 1 hora antes' },
  { icon: TrophyIcon, text: 'Resumo semanal das suas conquistas' },
]

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Etapas da conexão">
      {STEPS.map((label, index) => {
        const done = index < current
        const active = index === current
        return (
          <li
            key={label}
            aria-current={active ? 'step' : undefined}
            className="flex flex-1 items-center gap-2"
          >
            <span
              className={cn(
                'grid size-6 shrink-0 place-items-center rounded-full border text-xs font-medium transition-colors',
                done && 'border-transparent bg-emerald-500 text-white',
                active && 'border-primary text-primary',
                !done && !active && 'text-muted-foreground',
              )}
            >
              {done ? <CheckIcon className="size-3.5" /> : index + 1}
            </span>
            <span
              className={cn(
                'text-xs whitespace-nowrap',
                active ? 'font-medium' : 'text-muted-foreground',
              )}
            >
              {label}
            </span>
            {index < STEPS.length - 1 && (
              <span
                className={cn(
                  'h-px flex-1',
                  done ? 'bg-emerald-500/60' : 'bg-border',
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export function WhatsappPanel({
  showSettingsLink = false,
}: {
  showSettingsLink?: boolean
}) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const { data: status, isError } = useWhatsappStatus({
    polling: Boolean(qrCode),
  })
  const { connect, disconnect, sendTest } = useWhatsappActions()
  const connected = Boolean(status?.connected)

  function generateQrCode() {
    connect.mutate(undefined, {
      onSuccess: (data) => setQrCode(data.qrCode),
    })
  }

  // Renova o QR Code enquanto ninguém lê
  useEffect(() => {
    if (!qrCode || connected) return
    const timer = setTimeout(generateQrCode, QR_REFRESH_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCode, connected])

  // Avisa no momento em que a leitura acontece
  useEffect(() => {
    if (qrCode && connected) {
      setQrCode(null)
      toast.success('WhatsApp conectado')
    }
  }, [qrCode, connected])

  if (isError) {
    return (
      <p className="text-muted-foreground text-sm">
        Não foi possível falar com o serviço de WhatsApp. Verifique se a
        Evolution API está no ar.
      </p>
    )
  }

  if (!status) return <Skeleton className="h-64 w-full" />

  const step = connected ? 2 : qrCode ? 1 : 0

  return (
    <div className="grid gap-6">
      <Stepper current={connected ? 3 : step} />

      {step === 0 && (
        <div className="grid gap-5">
          <ul className="grid gap-3">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
          <Button
            size="lg"
            onClick={generateQrCode}
            disabled={connect.isPending}
            className="bg-emerald-600 text-white hover:bg-emerald-600/90"
          >
            {connect.isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <QrCodeIcon />
            )}
            {connect.isPending ? 'Gerando código…' : 'Gerar QR Code'}
          </Button>
        </div>
      )}

      {step === 1 && qrCode && (
        <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
          <div className="relative mx-auto size-56 overflow-hidden rounded-2xl border bg-white p-3 shadow-sm">
            <img
              src={qrCode}
              alt="QR Code para conectar o WhatsApp"
              className="size-full"
            />
            <span
              aria-hidden="true"
              className="animate-qr-scan absolute inset-x-3 h-0.5 rounded-full bg-emerald-500/70 shadow-[0_0_12px_2px] shadow-emerald-500/50"
            />
          </div>
          <div className="grid gap-4">
            <ol className="grid gap-2.5 text-sm">
              {[
                'Abra o WhatsApp no celular',
                'Toque em Aparelhos conectados',
                'Toque em Conectar um aparelho e aponte para o código',
              ].map((text, index) => (
                <li key={text} className="flex gap-2.5">
                  <span className="bg-muted text-muted-foreground grid size-5 shrink-0 place-items-center rounded-full font-mono text-[11px]">
                    {index + 1}
                  </span>
                  {text}
                </li>
              ))}
            </ol>
            <p className="text-muted-foreground flex items-center gap-2 text-xs">
              <Loader2Icon className="size-3.5 animate-spin" />
              Aguardando a leitura. O código se renova sozinho.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="justify-self-start"
              onClick={generateQrCode}
              disabled={connect.isPending}
            >
              <RefreshCwIcon />
              Gerar novo código
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid justify-items-center gap-4 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckIcon className="size-7" />
          </span>
          <div>
            <p className="font-semibold">Conectado</p>
            <p className="text-muted-foreground font-mono text-sm">
              {formatWhatsappNumber(status.ownerNumber)}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => sendTest.mutate()}
              disabled={sendTest.isPending}
            >
              <SendIcon />
              Enviar mensagem de teste
            </Button>
            <Button
              variant="ghost"
              onClick={() => disconnect.mutate()}
              disabled={disconnect.isPending}
            >
              <UnplugIcon />
              Desconectar
            </Button>
          </div>
          {showSettingsLink && (
            <p className="text-muted-foreground text-xs">
              Escolha quais lembretes receber em{' '}
              <Link
                to="/settings"
                className="text-foreground underline underline-offset-4"
              >
                Configurações
              </Link>
              .
            </p>
          )}
        </div>
      )}
    </div>
  )
}
