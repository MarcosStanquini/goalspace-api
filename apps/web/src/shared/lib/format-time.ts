const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

function plural(value: number, one: string, many: string) {
  return `${value} ${value === 1 ? one : many}`
}

function formatDistance(ms: number) {
  if (ms < HOUR)
    return plural(Math.max(1, Math.round(ms / 60_000)), 'min', 'min')
  if (ms < DAY) return plural(Math.round(ms / HOUR), 'hora', 'horas')
  if (ms < 60 * DAY) return plural(Math.round(ms / DAY), 'dia', 'dias')
  return plural(Math.round(ms / (30 * DAY)), 'mês', 'meses')
}

// "em 3 dias" / "há 2 horas"
export function formatTimeLeft(deadline: Date | string, now: number) {
  const diff = new Date(deadline).getTime() - now
  return diff >= 0
    ? `em ${formatDistance(diff)}`
    : `há ${formatDistance(Math.abs(diff))}`
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})
const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
})

export const formatDate = (date: Date | string | number) =>
  dateFormatter.format(new Date(date))
export const formatDateTime = (date: Date | string | number) =>
  dateTimeFormatter.format(new Date(date))
export const formatShortDate = (date: Date | string | number) =>
  shortDateFormatter
    .format(new Date(date))
    .replace(' de ', ' ')
    .replace('.', '')

// Valor para <input type="datetime-local"> no fuso do navegador
export function toDateTimeLocal(date: Date | string) {
  const value = new Date(date)
  const offset = value.getTimezoneOffset() * 60_000
  return new Date(value.getTime() - offset).toISOString().slice(0, 16)
}
