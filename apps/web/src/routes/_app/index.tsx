import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { SettingsIcon } from 'lucide-react'
import { AccountMenu } from '@/app/account-menu'
import { profileQuery } from '@/features/account'
import { DockButton, GoalUniverse } from '@/features/goals'
import { WhatsappCallout, WhatsappHeaderButton } from '@/features/whatsapp'

interface UniverseSearch {
  goal?: string
  view?: 'list'
}

export const Route = createFileRoute('/_app/')({
  // A meta aberta e o painel de metas ficam na URL: dá para compartilhar e voltar
  validateSearch: (search: Record<string, unknown>): UniverseSearch => ({
    goal: typeof search.goal === 'string' ? search.goal : undefined,
    view: search.view === 'list' ? 'list' : undefined,
  }),
  component: UniversePage,
})

function UniversePage() {
  const { goal, view } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: profile } = useQuery(profileQuery())

  return (
    <GoalUniverse
      userName={profile?.name.split(' ')[0]}
      selectedId={goal}
      onSelect={(id) => navigate({ search: (prev) => ({ ...prev, goal: id }) })}
      listOpen={view === 'list'}
      onListOpenChange={(open) =>
        navigate({
          search: (prev) => ({ ...prev, view: open ? 'list' : undefined }),
        })
      }
      actions={
        <>
          <WhatsappHeaderButton />
          <AccountMenu className="bg-white/10 hover:bg-white/15" />
        </>
      }
      callout={<WhatsappCallout />}
      dockExtra={
        <DockButton label="Configurações" asChild>
          <Link to="/settings">
            <SettingsIcon />
          </Link>
        </DockButton>
      }
    />
  )
}
