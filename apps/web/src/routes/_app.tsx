import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { authApi } from '@/features/auth'

// Só protege as rotas: cada página escolhe o próprio layout
export const Route = createFileRoute('/_app')({
  beforeLoad: () => {
    if (!authApi.isAuthenticated()) throw redirect({ to: '/login' })
  },
  component: Outlet,
})
