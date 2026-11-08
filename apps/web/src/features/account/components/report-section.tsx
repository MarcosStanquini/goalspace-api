import { useMutation } from '@tanstack/react-query'
import { DownloadIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import { downloadReport } from '../queries'
import { SettingsSection } from './settings-section'

export function ReportSection() {
  const report = useMutation({
    mutationFn: downloadReport,
    onError: (error) => toast.error(error.message),
  })

  return (
    <SettingsSection
      title="Relatório"
      description="Um PDF com todas as suas metas e subtarefas."
    >
      <Button
        variant="outline"
        onClick={() => report.mutate()}
        disabled={report.isPending}
      >
        <DownloadIcon />
        {report.isPending ? 'Gerando…' : 'Baixar PDF'}
      </Button>
    </SettingsSection>
  )
}
