import type { ReactNode } from 'react'
import { createDemoGoals, SolarSystem } from '@/features/goals'
import { Logo } from '@/shared/components/logo'
import { ThemeToggle } from '@/shared/components/theme-toggle'

const now = Date.now()
const demoGoals = createDemoGoals(now)

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="flex flex-col px-4 py-5 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1 mb-7 text-sm">
            {description}
          </p>
          {children}
          <p className="text-muted-foreground mt-6 text-sm">{footer}</p>
        </main>
      </div>

      <aside className="relative hidden overflow-hidden border-l bg-[#04050c] lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,#12173a_0%,#090c1d_55%,#03040a_100%)]" />
        <SolarSystem goals={demoGoals} now={now} interactive={false} />
        <p className="absolute inset-x-0 bottom-10 mx-auto max-w-sm text-center text-sm text-white/60">
          Cada meta é um planeta. Quanto mais perto do prazo, mais perto do
          centro.
        </p>
      </aside>
    </div>
  )
}
