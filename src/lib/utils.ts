export function formatDate(date: string | Date, locale = 'es-ES'): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
}
