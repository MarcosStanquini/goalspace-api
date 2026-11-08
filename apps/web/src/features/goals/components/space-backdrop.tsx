/**
 * Fundo atrás da cena 3D: só gradientes estáticos (as estrelas são da cena).
 * Nada de blur nem animação aqui: isso pesava muito por quadro.
 */
export function SpaceBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background: [
          'radial-gradient(ellipse 55% 45% at 22% 18%, rgba(76, 63, 209, 0.22), transparent 70%)',
          'radial-gradient(ellipse 50% 45% at 85% 88%, rgba(15, 127, 156, 0.18), transparent 70%)',
          'radial-gradient(ellipse 40% 35% at 60% 45%, rgba(176, 63, 138, 0.10), transparent 70%)',
          'radial-gradient(ellipse at 50% 52%, #12173a 0%, #090c1d 50%, #03040a 100%)',
        ].join(', '),
      }}
    />
  )
}
