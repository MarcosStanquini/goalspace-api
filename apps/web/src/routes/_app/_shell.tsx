import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppHeader } from '@/app/app-header'

// Layout das páginas "normais" (configurações), com cabeçalho
export const Route = createFileRoute('/_app/_shell')({
  component: ShellLayout,
})

function ShellLayout() {
  return (
    <div className="min-h-svh">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
