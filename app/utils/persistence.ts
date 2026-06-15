import type { PlanDocument, Task, Estado } from '~/types'
import { SCHEMA_VERSION, DEFAULT_SETTINGS } from '~/types'
import { SEED_TASKS } from '~/data/seed'
import { rollupTask } from '~/utils/rollup'
import { generateSprints, suggestSprint } from '~/utils/sprints'
import { toISODate } from '~/utils/plan'

export const STORAGE_KEY = 'plan-verano-2026'

type LegacyOverlay = Record<string, { estado: Estado; pct: number }>

const nowISO = () => new Date().toISOString()

// --- I/O bruto -------------------------------------------------------------
function readRaw(): unknown | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? JSON.parse(s) : null
  } catch { return null }
}

export function writeDoc(doc: PlanDocument): void {
  if (typeof localStorage === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(doc)) } catch { /* QuotaExceeded: datos minúsculos, improbable */ }
}

export function clearStorage(): void {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY)
}

// --- Construcción desde el seed -------------------------------------------
export function buildSeedDocument(overlay?: LegacyOverlay): PlanDocument {
  const tasks: Task[] = structuredClone(SEED_TASKS)
  const sprints = generateSprints(DEFAULT_SETTINGS.summerStart, DEFAULT_SETTINGS.sprintCount, DEFAULT_SETTINGS.vacationWeeks)

  for (const t of tasks) {
    for (const s of t.subtasks) {
      if (overlay) {
        const o = overlay[s.id]
        if (o) { s.estado = o.estado; s.pct = Math.max(0, Math.min(100, o.pct)) }
      }
      // auto-asignación inicial: cada subtarea al sprint donde empieza
      if (s.sprintId == null) s.sprintId = suggestSprint(s, sprints)
    }
    if (overlay && t.type === 'task' && t.subtasks.length === 0) {
      const o = overlay['t:' + t.code]
      if (o) { t.estado = o.estado; t.pct = Math.max(0, Math.min(100, o.pct)) }
    }
    rollupTask(t)
  }

  return { version: SCHEMA_VERSION, savedAt: nowISO(), settings: structuredClone(DEFAULT_SETTINGS), tasks, sprints }
}

export function resetToSeed(): PlanDocument {
  return buildSeedDocument()
}

// --- Reconciliación de sprints --------------------------------------------
export function reconcileSprints(doc: PlanDocument): PlanDocument {
  const fresh = generateSprints(doc.settings.summerStart, doc.settings.sprintCount, doc.settings.vacationWeeks)
  const byN = new Map(doc.sprints.map(s => [s.n, s]))
  doc.sprints = fresh.map(f => {
    const prev = byN.get(f.n)
    return { ...f, label: prev?.label, vac: prev ? prev.vac : f.vac }
  })
  const valid = new Set(doc.sprints.map(s => s.n))
  for (const t of doc.tasks) for (const s of t.subtasks) {
    if (s.sprintId != null && !valid.has(s.sprintId)) s.sprintId = null
  }
  return doc
}

// --- Normalización / validación -------------------------------------------
function normalize(doc: PlanDocument): PlanDocument {
  doc.settings = { ...DEFAULT_SETTINGS, ...(doc.settings || {}) }
  doc.tasks = (doc.tasks || []).map(t => {
    t.subtasks = (t.subtasks || []).map(s => ({ ...s, pct: Math.max(0, Math.min(100, s.pct ?? 0)) }))
    rollupTask(t)
    return t
  })
  return doc
}

export function validateDoc(doc: any): string | null {
  if (!doc || typeof doc !== 'object') return 'Documento no válido'
  if (typeof doc.version !== 'number') return 'Falta el número de versión'
  if (!Array.isArray(doc.tasks)) return 'Falta la lista de tareas'
  const ids = new Set<string>()
  for (const t of doc.tasks) {
    if (!t.id || ids.has(t.id)) return `ID de tarea duplicado o ausente: ${t.id}`
    ids.add(t.id)
    if (!Array.isArray(t.subtasks)) return `Tarea ${t.code} sin subtareas`
  }
  return null
}

// --- Migración + carga -----------------------------------------------------
export function migrate(raw: any): PlanDocument {
  // Documento v2+
  if (raw && typeof raw === 'object' && typeof raw.version === 'number') {
    return reconcileSprints(normalize(raw as PlanDocument))
  }
  // Overlay legacy v1 (sin version) → construir desde seed aplicando progreso
  return buildSeedDocument((raw as LegacyOverlay) || undefined)
}

export function loadDocument(): PlanDocument {
  const raw = readRaw()
  if (raw == null) return buildSeedDocument()
  return migrate(raw)
}

// --- Export / import -------------------------------------------------------
export function downloadJSON(doc: PlanDocument): void {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: `plan-verano-${doc.savedAt.slice(0, 10)}.json` })
  a.click()
  URL.revokeObjectURL(url)
}

export function importJSON(text: string): { ok: true; doc: PlanDocument } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(text)
    const doc = migrate(parsed)
    const err = validateDoc(doc)
    return err ? { ok: false, error: err } : { ok: true, doc }
  } catch {
    return { ok: false, error: 'JSON inválido' }
  }
}
