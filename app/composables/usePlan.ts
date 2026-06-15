import type { PlanDocument, Task, Subtask, Estado, Level, TaskType, DerivedGroup } from '~/types'
import { SCHEMA_VERSION, DEFAULT_SETTINGS, LEVELS } from '~/types'
import { LEVEL_PRIORITY } from '~/utils/plan'
import { rollupTask } from '~/utils/rollup'
import { generateSprints, suggestSprint, computeSprintMetrics } from '~/utils/sprints'
import {
  loadDocument, writeDoc, resetToSeed as buildReset, downloadJSON, reconcileSprints
} from '~/utils/persistence'
import {
  overallProgress, progressByLevel, countsByEstado, currentSprintInfo,
  upcomingMilestones, riskBreakdown, overdueSubtasks
} from '~/utils/dashboard'

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))
const nowISO = () => new Date().toISOString()
function newId(prefix: string) {
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
  return `${prefix}_${uuid}`
}

function emptyDoc(): PlanDocument {
  return {
    version: SCHEMA_VERSION,
    savedAt: '',
    settings: structuredClone(DEFAULT_SETTINGS),
    tasks: [],
    sprints: generateSprints(DEFAULT_SETTINGS.summerStart, DEFAULT_SETTINGS.sprintCount, DEFAULT_SETTINGS.vacationWeeks)
  }
}

const LEVEL_ORDER: Level[] = ['L0', 'L1', 'L2', 'L3']

/** Agrupa las tareas (lista plana) en grupos por nivel + groupLabel, para el Gantt. */
function buildGroups(tasks: Task[]): DerivedGroup[] {
  const groups: DerivedGroup[] = []
  for (const level of LEVEL_ORDER) {
    const inLevel = tasks.filter(t => t.level === level)
    if (!inLevel.length) continue
    const ungrouped = inLevel.filter(t => !t.groupLabel)
    if (ungrouped.length) {
      const label = level === 'L0' ? 'Continuos · L0' : `${level} · ${LEVEL_PRIORITY[level]}`
      groups.push({ label, level, tasks: ungrouped })
    }
    const seen = new Set<string>()
    for (const t of inLevel) {
      if (t.groupLabel && !seen.has(t.groupLabel)) {
        seen.add(t.groupLabel)
        groups.push({ label: t.groupLabel, level, tasks: inLevel.filter(x => x.groupLabel === t.groupLabel) })
      }
    }
  }
  return groups
}

export function usePlan() {
  const doc = useState<PlanDocument>('plan-doc', emptyDoc)
  const ready = useState<boolean>('plan-ready', () => false)
  const today = useToday()

  // --- persistencia ---
  function touch() { doc.value.savedAt = nowISO() }
  function save() { if (ready.value) writeDoc(doc.value) }

  function load() {
    doc.value = loadDocument()
    ready.value = true
  }
  function replaceDoc(next: PlanDocument) { doc.value = next; touch(); save() }
  function resetToSeed() { replaceDoc(buildReset()) }
  function exportNow() { touch(); save(); downloadJSON(doc.value) }

  // --- selectores ---
  const tasks = computed(() => doc.value.tasks)
  const sprints = computed(() => doc.value.sprints)
  const settings = computed(() => doc.value.settings)
  const allSubtasks = computed(() => doc.value.tasks.flatMap(t => t.subtasks))
  const focusTasks = computed(() => tasks.value.filter(t => t.type === 'task'))
  const groups = computed(() => buildGroups(tasks.value))

  const currentSprint = computed(() => currentSprintInfo(sprints.value, today.value))
  const overall = computed(() => overallProgress(tasks.value))
  const byLevel = computed(() => progressByLevel(tasks.value))
  const counts = computed(() => countsByEstado(tasks.value))
  const upcoming = computed(() => upcomingMilestones(tasks.value, today.value, 5))
  const risk = computed(() => riskBreakdown(tasks.value, sprints.value, today.value))
  const overdue = computed(() => overdueSubtasks(tasks.value, today.value))

  const sprintMetrics = computed(() =>
    sprints.value.map(sp => computeSprintMetrics(sp, allSubtasks.value.filter(s => s.sprintId === sp.n), today.value)))

  function subtasksOf(n: number | null) {
    return doc.value.tasks.flatMap(t => t.subtasks.filter(s => s.sprintId === n).map(s => ({ sub: s, task: t })))
  }

  // --- helpers internos ---
  function findTask(id: string) { return doc.value.tasks.find(t => t.id === id) }

  // --- acciones · tareas ---
  function createTask(input: { name: string; level: Level; type?: TaskType; code?: string; resp?: string; start?: string | null; end?: string | null; groupLabel?: string }) {
    const type = input.type ?? 'task'
    const t: Task = {
      id: newId('task'),
      code: (input.code || '').trim(),
      name: input.name.trim(),
      resp: (input.resp || settings.value.defaultResp).trim(),
      level: input.level,
      type,
      start: input.start ?? null,
      end: input.end ?? null,
      subtasks: [],
      estado: type === 'cont' ? 'Continuo' : 'Pendiente',
      pct: type === 'cont' ? null : 0,
      groupLabel: input.groupLabel || undefined
    }
    doc.value.tasks.push(t)
    touch()
    return t.id
  }

  function updateTask(id: string, patch: Partial<Pick<Task, 'name' | 'code' | 'resp' | 'level' | 'type' | 'start' | 'end' | 'groupLabel' | 'estado' | 'pct'>>) {
    const t = findTask(id); if (!t) return
    if (patch.name !== undefined) t.name = patch.name
    if (patch.code !== undefined) t.code = patch.code
    if (patch.resp !== undefined) t.resp = patch.resp
    if (patch.level !== undefined) t.level = patch.level
    if (patch.groupLabel !== undefined) t.groupLabel = patch.groupLabel || undefined
    if (patch.start !== undefined) t.start = patch.start
    if (patch.end !== undefined) t.end = patch.end
    if (patch.type !== undefined) t.type = patch.type
    // estado/pct manuales solo para tareas sin subtareas (las demás se derivan)
    if (t.type === 'task' && t.subtasks.length === 0) {
      if (patch.pct !== undefined) t.pct = clamp(patch.pct ?? 0)
      if (patch.estado !== undefined) {
        t.estado = patch.estado
        if (patch.estado === 'Completada' && patch.pct === undefined) t.pct = 100
        if (patch.estado === 'Pendiente' && patch.pct === undefined) t.pct = 0
      }
    }
    rollupTask(t)
    touch()
  }

  function deleteTask(id: string) {
    doc.value.tasks = doc.value.tasks.filter(t => t.id !== id)
    touch()
  }

  function duplicateTask(id: string) {
    const t = findTask(id); if (!t) return
    const copy: Task = structuredClone(toRaw(t))
    copy.id = newId('task')
    copy.code = copy.code ? copy.code + '·2' : ''
    copy.name = copy.name + ' (copia)'
    copy.subtasks = copy.subtasks.map(s => ({ ...s, id: newId('sub') }))
    doc.value.tasks.push(copy)
    touch()
    return copy.id
  }

  // --- acciones · subtareas ---
  function addSubtask(taskId: string, input: { name: string; resp?: string; start?: string | null; end?: string | null; milestone?: boolean }) {
    const t = findTask(taskId); if (!t) return
    const sub: Subtask = {
      id: newId('sub'),
      name: input.name.trim(),
      resp: (input.resp || t.resp || settings.value.defaultResp).trim(),
      start: input.start ?? null,
      end: input.end ?? null,
      estado: 'Pendiente',
      pct: 0,
      sprintId: null,
      milestone: input.milestone || undefined
    }
    sub.sprintId = suggestSprint(sub, doc.value.sprints)
    t.subtasks.push(sub)
    rollupTask(t)
    touch()
    return sub.id
  }

  function updateSubtask(taskId: string, subId: string, patch: Partial<Subtask>) {
    const t = findTask(taskId); if (!t) return
    const s = t.subtasks.find(x => x.id === subId); if (!s) return
    if (patch.name !== undefined) s.name = patch.name
    if (patch.resp !== undefined) s.resp = patch.resp
    if (patch.start !== undefined) s.start = patch.start
    if (patch.end !== undefined) s.end = patch.end
    if (patch.milestone !== undefined) s.milestone = patch.milestone || undefined
    if (patch.sprintId !== undefined) s.sprintId = patch.sprintId
    if (patch.pct !== undefined) s.pct = clamp(patch.pct)
    if (patch.estado !== undefined) {
      s.estado = patch.estado
      if (patch.estado === 'Completada' && patch.pct === undefined) s.pct = 100
      if (patch.estado === 'Pendiente' && patch.pct === undefined) s.pct = 0
    }
    rollupTask(t)
    touch()
  }

  function deleteSubtask(taskId: string, subId: string) {
    const t = findTask(taskId); if (!t) return
    t.subtasks = t.subtasks.filter(s => s.id !== subId)
    rollupTask(t)
    touch()
  }

  function moveSubtask(subId: string, toTaskId: string) {
    let moved: Subtask | undefined
    for (const t of doc.value.tasks) {
      const i = t.subtasks.findIndex(s => s.id === subId)
      if (i >= 0) { moved = t.subtasks.splice(i, 1)[0]; rollupTask(t); break }
    }
    const dest = findTask(toTaskId)
    if (moved && dest) { dest.subtasks.push(moved); rollupTask(dest) }
    touch()
  }

  // --- acciones · sprints ---
  function assignSubtaskToSprint(subId: string, n: number | null) {
    const s = allSubtasks.value.find(x => x.id === subId)
    if (s) { s.sprintId = n; touch() }
  }

  function autoAssignSprints() {
    for (const s of allSubtasks.value) s.sprintId = suggestSprint(s, doc.value.sprints)
    touch()
  }

  function updateSprint(n: number, patch: { label?: string; vac?: boolean }) {
    const sp = doc.value.sprints.find(s => s.n === n); if (!sp) return
    if (patch.label !== undefined) sp.label = patch.label || undefined
    if (patch.vac !== undefined) sp.vac = patch.vac
    touch()
  }

  // --- acciones · settings ---
  function updateSettings(patch: Partial<typeof doc.value.settings>) {
    const before = doc.value.settings
    doc.value.settings = { ...before, ...patch }
    if (patch.summerStart || patch.sprintCount || patch.vacationWeeks) reconcileSprints(doc.value)
    touch()
  }

  return {
    doc, ready, today,
    // selectores
    tasks, sprints, settings, allSubtasks, focusTasks, groups,
    currentSprint, overall, byLevel, counts, upcoming, risk, overdue, sprintMetrics, subtasksOf,
    // ciclo de vida / persistencia
    load, save, replaceDoc, resetToSeed, exportNow, levels: LEVELS,
    // acciones
    createTask, updateTask, deleteTask, duplicateTask,
    addSubtask, updateSubtask, deleteSubtask, moveSubtask,
    assignSubtaskToSprint, autoAssignSprints, updateSprint, updateSettings
  }
}
