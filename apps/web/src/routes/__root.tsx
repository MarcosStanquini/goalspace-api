import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { Button } from '@/shared/ui/button'

export const Route = createRootRoute({
  component: Outlet,
  notFoundComponent: () => (
    <main className="grid min-h-svh place-content-center justify-items-center gap-3 p-4 text-center">
      <p className="font-mono text-sm">404</p>
      <h1 className="text-xl font-semibold tracking-tight">
        Esta página saiu de órbita
      </h1>
      <Button asChild variant="outline">
        <Link to="/">Voltar para a carta</Link>
      </Button>
    </main>
  ),
})
