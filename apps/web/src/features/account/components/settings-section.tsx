import type { ReactNode } from 'react'

// Título à esquerda e conteúdo à direita, separados por uma linha fina
export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="grid gap-4 border-t py-8 md:grid-cols-[16rem_minmax(0,1fr)] md:gap-10">
      <div>
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}
