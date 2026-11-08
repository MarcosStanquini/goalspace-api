import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from './theme-provider'
import { Button } from '@/shared/ui/button'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <SunIcon className="hidden dark:block" />
      <MoonIcon className="dark:hidden" />
    </Button>
  )
}
