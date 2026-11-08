import { createFileRoute } from '@tanstack/react-router'
import {
  PasswordSection,
  ProfileSection,
  ReportSection,
  SettingsSection,
} from '@/features/account'
import { NotificationsForm } from '@/features/notifications'
import { WhatsappPanel } from '@/features/whatsapp'

export const Route = createFileRoute('/_app/_shell/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">
        Configurações
      </h1>
      <ProfileSection />
      <SettingsSection
        title="WhatsApp"
        description="Os lembretes das suas metas chegam no número conectado aqui."
      >
        <div className="max-w-xl">
          <WhatsappPanel />
        </div>
      </SettingsSection>
      <SettingsSection
        title="Notificações"
        description="Escolha o que você quer receber."
      >
        <NotificationsForm />
      </SettingsSection>
      <ReportSection />
      <PasswordSection />
    </div>
  )
}
