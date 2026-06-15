// ---------------------------------------------------------------------------
// Modelo de datos · Plan de Tareas Verano 2026
// ---------------------------------------------------------------------------

export type Level = 'L0' | 'L1' | 'L2' | 'L3'
export type Estado = 'Pendiente' | 'En curso' | 'Bloqueada' | 'Completada' | 'Continuo'
export type TaskType = 'task' | 'cont'

/** Fecha ISO 'YYYY-MM-DD' (o null si sin fecha). */
export type ISODate = string

/** Objetivo / subtarea. Es la unidad que lleva el progreso. */
export interface Subtask {
  id: string
  name: string
  resp: string
  start: ISODate | null
  end: ISODate | null
  estado: Estado          // nunca 'Continuo'
  pct: number             // 0..100
  sprintId: number | null // nº de sprint (1..12) o null = backlog
  milestone?: boolean      // hito (antes el prefijo '◆')
}

/** Tarea. Su pct/estado se derivan de las subtareas (salvo task sin subtareas o cont). */
export interface Task {
  id: string
  code: string            // etiqueta corta editable (CV, PAC…)
  name: string
  resp: string
  level: Level
  type: TaskType
  start: ISODate | null   // span manual; si null se deriva de subtareas
  end: ISODate | null
  subtasks: Subtask[]
  estado: Estado
  pct: number | null      // null para 'cont'
  groupLabel?: string      // sub-encabezado semántico opcional
}

/** Sprint semanal fijo (lun–vie). `current` se calcula en vivo, no se almacena. */
export interface Sprint {
  n: number               // 1..12 (también la columna del Gantt)
  monday: ISODate
  friday: ISODate
  vac: boolean
  label?: string
}

export interface AppSettings {
  summerStart: ISODate    // lunes ancla para generar sprints
  summerEnd: ISODate
  sprintCount: number
  vacationWeeks: number[] // nº de sprint en vacaciones
  defaultResp: string
  countUpAnimations: boolean
}

export const SCHEMA_VERSION = 2

/** Documento raíz persistido en localStorage. */
export interface PlanDocument {
  version: number
  savedAt: string
  settings: AppSettings
  tasks: Task[]
  sprints: Sprint[]
}

/** Grupo derivado (solo vista, nunca persistido). */
export interface DerivedGroup {
  label: string
  level: Level
  tasks: Task[]
}

// --- Estados / niveles seleccionables -------------------------------------
export const ESTADOS: Estado[] = ['Pendiente', 'En curso', 'Bloqueada', 'Completada']
export const LEVELS: Level[] = ['L1', 'L2', 'L3', 'L0']

export const DEFAULT_SETTINGS: AppSettings = {
  summerStart: '2026-06-15',
  summerEnd: '2026-09-01',
  sprintCount: 12,
  vacationWeeks: [5, 6, 9],
  defaultResp: 'Erik',
  countUpAnimations: true
}
