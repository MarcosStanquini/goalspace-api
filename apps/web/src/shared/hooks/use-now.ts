import { useEffect, useState } from 'react'

// Hora atual, atualizada periodicamente para contagens regressivas
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])

  return now
}
