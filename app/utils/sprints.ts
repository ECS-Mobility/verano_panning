import type { Sprint, Subtask, ISODate } from '~/types'
import { barSpan, d, toISODate } from '~/utils/plan'
import { isDone } from '~/utils/rollup'

/**
 * Genera los sprints semanales (lun–vie) desde una fecha lunes ancla.
 * Usa aritmética de calendario (setDate), NO suma de ms (que derivaría un día por UTC).
 */
export function generateSprints(
  startISO: ISODate,
  count: number,
  vacationWeeks: number[]
): Sprint[] {
  const out: Sprint[] = []
  for (let i = 0; i < count; i++) {
    const mon = new Date(startISO + 'T00:00:00')
    mon.setDate(mon.getDate() + i * 7)
    const fri = new Date(mon)
    fri.setDate(fri.getDate() + 4)
    out.push({
      n: i + 1,
      monday: toISODate(mon),
      friday: toISODate(fri),
      vac: vacationWeeks.includes(i + 1)
    })
  }
  return out
}

/** Sprint sugerido para una subtarea según sus fechas (donde empieza). */
export function suggestSprint(sub: Subtask, sprints: Sprint[]): number | null {
  const span = barSpan(sub.start, sub.end, sprints)
  if (!span) return null
  const n = span[0] // 1-based = nº del sprint donde empieza
  return n >= 1 && n <= sprints.length ? n : null
}

/** ¿El sprint ya terminó respecto a hoy? */
export function isSprintPast(sprint: Sprint, today: ISODate): boolean {
  return d(sprint.friday) < d(today)
}
/** ¿Hoy cae dentro del lun–vie del sprint? */
export function isSprintCurrent(sprint: Sprint, today: ISODate): boolean {
  return d(today) >= d(sprint.monday) && d(today) <= d(sprint.friday)
}

export type SprintStatus = 'vacation' | 'empty' | 'completed' | 'active' | 'at-risk' | 'upcoming'

export interface SprintMetrics {
  n: number
  assigned: number
  done: number
  inProgress: number
  pending: number
  blocked: number
  pctAvg: number       // headline (media de pct)
  pctByCount: number   // done / assigned
  carryOver: number    // asignadas a sprint pasado sin terminar
  cumplimiento: number | null // null = no cuenta (vacaciones / vacío)
  status: SprintStatus
}

/** Métricas de un sprint a partir de las subtareas que tiene asignadas. */
export function computeSprintMetrics(
  sprint: Sprint,
  members: Subtask[],
  today: ISODate
): SprintMetrics {
  const assigned = members.length
  const done = members.filter(isDone).length
  const inProgress = members.filter(s => !isDone(s) && s.pct > 0 && s.estado !== 'Bloqueada').length
  const blocked = members.filter(s => s.estado === 'Bloqueada').length
  const pending = members.filter(s => !isDone(s) && s.pct === 0 && s.estado !== 'Bloqueada').length
  const pctAvg = assigned ? Math.round(members.reduce((a, s) => a + s.pct, 0) / assigned) : 0
  const pctByCount = assigned ? Math.round((done / assigned) * 100) : 0
  const past = isSprintPast(sprint, today)
  const carryOver = past ? members.filter(s => !isDone(s)).length : 0
  const cumplimiento = sprint.vac || assigned === 0 ? null : pctAvg

  let status: SprintStatus
  if (sprint.vac) status = 'vacation'
  else if (assigned === 0) status = 'empty'
  else if (pctByCount === 100) status = 'completed'
  else if (isSprintCurrent(sprint, today)) status = 'active'
  else if (past && carryOver > 0) status = 'at-risk'
  else status = 'upcoming'

  return { n: sprint.n, assigned, done, inProgress, pending, blocked, pctAvg, pctByCount, carryOver, cumplimiento, status }
}

/** Cumplimiento global del verano: media de cumplimientos hasta el sprint actual (incluido). */
export function summerCumplimiento(metrics: SprintMetrics[], currentN: number): number {
  const scored = metrics.filter(m => m.n <= currentN && m.cumplimiento !== null)
  return scored.length ? Math.round(scored.reduce((a, m) => a + (m.cumplimiento as number), 0) / scored.length) : 0
}
