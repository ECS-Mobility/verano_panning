import type { Level, Estado, ISODate } from '~/types'

export const LEVEL_BAR: Record<Level, string> = {
  L0: 'bg-steel', L1: 'bg-navy', L2: 'bg-steel2', L3: 'bg-l3'
}
export const LEVEL_LABEL: Record<Level, string> = {
  L0: 'Continuo', L1: 'Alta', L2: 'Media', L3: 'Baja'
}
export const LEVEL_PRIORITY: Record<Level, string> = {
  L0: 'Continuo', L1: 'Prioridad alta', L2: 'Prioridad media', L3: 'Prioridad baja'
}
export const ESTADO_DOT: Record<Estado, string> = {
  'Pendiente': 'bg-vac', 'En curso': 'bg-steel2', 'Bloqueada': 'bg-block',
  'Completada': 'bg-steel', 'Continuo': 'bg-steel'
}

// --- Helpers de fecha (siempre en hora LOCAL para evitar drift UTC) --------
export const d = (s: ISODate) => new Date(s + 'T00:00:00').getTime()

/** Date → 'YYYY-MM-DD' en hora local. */
export function toISODate(date: Date): ISODate {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Días enteros entre dos fechas ISO (b - a). */
export function daysBetween(a: ISODate, b: ISODate): number {
  return Math.round((d(b) - d(a)) / 864e5)
}

// Devuelve [colInicio, colFin] 1-based sobre la rejilla de semanas, o null si no solapa.
export function barSpan(
  start: ISODate | null,
  end: ISODate | null,
  weeks: { monday: ISODate }[]
): [number, number] | null {
  if (!start || !end) return null
  const s = d(start), e = d(end)
  let a = -1, b = -1
  weeks.forEach((w, i) => {
    const ws = d(w.monday), we = ws + 6 * 864e5
    if (s <= we && e >= ws) { if (a < 0) a = i; b = i }
  })
  return a < 0 ? null : [a + 1, b + 2]
}

export const fmt = (s: ISODate | null) =>
  s ? new Date(s + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : '—'

export const fmtLong = (s: ISODate | null) =>
  s ? new Date(s + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : '—'
