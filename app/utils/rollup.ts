import type { Task, ISODate } from '~/types'
import { d } from '~/utils/plan'

/** ¿La subtarea/tarea está terminada? (pct o estado). */
export function isDone(x: { pct?: number | null; estado?: string }): boolean {
  return (x.pct ?? 0) >= 100 || x.estado === 'Completada'
}

/**
 * Recalcula pct/estado de una tarea a partir de sus subtareas.
 * - cont          → 'Continuo', pct null
 * - sin subtareas → no toca nada (editable a mano)
 * - con subtareas → media de pct; estado derivado
 */
export function rollupTask(t: Task): void {
  if (t.type === 'cont') { t.estado = 'Continuo'; t.pct = null; return }
  if (t.subtasks.length === 0) return
  const blocked = t.subtasks.some(s => s.estado === 'Bloqueada')
  const pct = Math.round(t.subtasks.reduce((a, s) => a + s.pct, 0) / t.subtasks.length)
  t.pct = pct
  t.estado = blocked ? 'Bloqueada'
    : pct >= 100 ? 'Completada'
    : pct > 0 ? 'En curso'
    : 'Pendiente'
}

/** Span efectivo de una tarea: el manual si existe, si no el derivado de subtareas. */
export function taskSpan(t: Task): { start: ISODate | null; end: ISODate | null } {
  if (t.start && t.end) return { start: t.start, end: t.end }
  const dated = t.subtasks.filter(s => s.start && s.end)
  if (!dated.length) return { start: t.start, end: t.end }
  const start = dated.reduce((m, s) => (d(s.start!) < d(m) ? s.start! : m), dated[0]!.start!)
  const end = dated.reduce((m, s) => (d(s.end!) > d(m) ? s.end! : m), dated[0]!.end!)
  return { start, end }
}
