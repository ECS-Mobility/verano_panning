import type { Task, Subtask, Sprint, Level, ISODate } from '~/types'
import { d } from '~/utils/plan'
import { isDone } from '~/utils/rollup'
import { isSprintPast } from '~/utils/sprints'

export const MILESTONE_MARK = '◆'
export function isMilestone(s: Subtask): boolean {
  return s.milestone === true || s.name.trimStart().startsWith(MILESTONE_MARK)
}
export function milestoneLabel(s: Subtask): string {
  return s.name.replace(/^\s*◆\s*/, '')
}

const focus = (tasks: Task[]) => tasks.filter(t => t.type === 'task')
const allSubtasks = (tasks: Task[]) => tasks.flatMap(t => t.subtasks)

/** Progreso global = media de pct de las tareas de foco (coherente con el rollup). */
export function overallProgress(tasks: Task[]): number {
  const ft = focus(tasks)
  return ft.length ? Math.round(ft.reduce((a, t) => a + (t.pct ?? 0), 0) / ft.length) : 0
}

const LEVEL_ORDER: Level[] = ['L1', 'L2', 'L3']
export function progressByLevel(tasks: Task[]): { level: Level; pct: number; count: number }[] {
  return LEVEL_ORDER.map(level => {
    const ts = focus(tasks).filter(t => t.level === level)
    const pct = ts.length ? Math.round(ts.reduce((a, t) => a + (t.pct ?? 0), 0) / ts.length) : 0
    return { level, pct, count: ts.length }
  })
}

export function countsByEstado(tasks: Task[]) {
  const ft = focus(tasks)
  return {
    total: ft.length,
    enCurso: ft.filter(t => t.estado === 'En curso').length,
    completadas: ft.filter(t => t.estado === 'Completada').length,
    bloqueadas: ft.filter(t => t.estado === 'Bloqueada').length,
    pendientes: ft.filter(t => t.estado === 'Pendiente').length
  }
}

export type SprintKind = 'before' | 'during' | 'weekend-gap' | 'after'
export interface CurrentSprintInfo { sprint: Sprint | null; kind: SprintKind }

/** Sprint actual = el que contiene hoy (con fallbacks antes/después/fin de semana). */
export function currentSprintInfo(sprints: Sprint[], today: ISODate): CurrentSprintInfo {
  if (!sprints.length) return { sprint: null, kind: 'before' }
  const first = sprints[0]!, last = sprints[sprints.length - 1]!
  const t = d(today)
  if (t < d(first.monday)) return { sprint: first, kind: 'before' }
  if (t > d(last.friday)) return { sprint: last, kind: 'after' }
  const hit = sprints.find(s => t >= d(s.monday) && t <= d(s.friday))
  if (hit) return { sprint: hit, kind: 'during' }
  // fin de semana dentro del verano → snap al lunes más reciente
  const wk = [...sprints].reverse().find(s => t >= d(s.monday))
  return { sprint: wk ?? first, kind: 'weekend-gap' }
}

export interface UpcomingMilestone {
  sub: Subtask
  taskCode: string
  label: string
  endISO: ISODate
  daysLeft: number
  overdue: boolean
}

/**
 * Próximos hitos (subtareas milestone con fecha fin y sin terminar), ordenados por fecha.
 * Si se pasa `withinDays`, solo incluye los que cierran dentro de esa ventana (los vencidos
 * siguen apareciendo porque su daysLeft es negativo).
 */
export function upcomingMilestones(tasks: Task[], today: ISODate, n = 5, withinDays?: number): UpcomingMilestone[] {
  const t = d(today)
  let list = tasks.flatMap(task =>
    task.subtasks.filter(s => isMilestone(s) && s.end && !isDone(s)).map(s => ({
      sub: s,
      taskCode: task.code,
      label: milestoneLabel(s),
      endISO: s.end!,
      daysLeft: Math.round((d(s.end!) - t) / 864e5),
      overdue: d(s.end!) < t
    }))
  )
  if (withinDays != null) list = list.filter(x => x.daysLeft <= withinDays)
  return list
    .sort((a, b) => (a.endISO < b.endISO ? -1 : a.endISO > b.endISO ? 1 : 0))
    .slice(0, n)
}

export interface RiskBreakdown {
  overdue: number
  dueSoon: number
  blocked: number
  carryOver: number
  total: number
}

/** Riesgo en vivo: vencidas, cierran ≤3 días, bloqueadas, carry-over. */
export function riskBreakdown(tasks: Task[], sprints: Sprint[], today: ISODate): RiskBreakdown {
  const t = d(today)
  const subs = allSubtasks(tasks)
  const sprintById = new Map(sprints.map(s => [s.n, s]))
  const overdueSet = new Set<string>()
  const dueSoonSet = new Set<string>()
  const blockedSet = new Set<string>()
  const carrySet = new Set<string>()
  for (const s of subs) {
    if (s.estado === 'Bloqueada') blockedSet.add(s.id)
    if (s.end && !isDone(s)) {
      const e = d(s.end)
      if (e < t) overdueSet.add(s.id)
      else if (e <= t + 3 * 864e5) dueSoonSet.add(s.id)
    }
    if (s.sprintId != null && !isDone(s)) {
      const sp = sprintById.get(s.sprintId)
      if (sp && isSprintPast(sp, today)) carrySet.add(s.id)
    }
  }
  const total = new Set([...overdueSet, ...dueSoonSet, ...blockedSet, ...carrySet]).size
  return { overdue: overdueSet.size, dueSoon: dueSoonSet.size, blocked: blockedSet.size, carryOver: carrySet.size, total }
}

/** Subtareas vencidas (fin < hoy y sin terminar). */
export function overdueSubtasks(tasks: Task[], today: ISODate): { sub: Subtask; taskCode: string }[] {
  const t = d(today)
  return tasks.flatMap(task =>
    task.subtasks
      .filter(s => s.end && !isDone(s) && d(s.end) < t)
      .map(s => ({ sub: s, taskCode: task.code }))
  )
}
