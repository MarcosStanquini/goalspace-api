import { Link } from '@tanstack/react-router'
import { WhatsappHeaderButton } from '@/features/whatsapp'
import { Logo } from '@/shared/components/logo'
import { ThemeToggle } from '@/shared/components/theme-toggle'
import { AccountMenu } from './account-menu'

export function AppHeader() {
  return (
    <header className="bg-background/85 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          aria-label="GoalSpace, voltar para o universo"
          className="rounded-md"
        >
          <Logo />
        </Link>

        <div className="flex items-center gap-1.5">
          <WhatsappHeaderButton />
          <ThemeToggle />
          <AccountMenu />
        </div>
      </div>
    </header>
  )
}
