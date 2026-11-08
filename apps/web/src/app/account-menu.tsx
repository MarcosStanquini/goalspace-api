import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { LogOutIcon, SettingsIcon } from 'lucide-react'
import { profileQuery } from '@/features/account'
import { authApi } from '@/features/auth'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

export function AccountMenu({ className }: { className?: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: profile } = useQuery(profileQuery())

  function handleLogout() {
    authApi.logout()
    queryClient.clear()
    navigate({ to: '/login' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Menu da conta"
          className={cn(
            'bg-secondary rounded-full text-xs font-semibold',
            className,
          )}
        >
          {profile?.name.charAt(0).toUpperCase() ?? ''}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="grid font-normal">
          <span className="truncate font-medium">{profile?.name}</span>
          <span className="text-muted-foreground truncate text-xs">
            {profile?.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <SettingsIcon />
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleLogout}>
          <LogOutIcon />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
