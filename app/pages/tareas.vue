<template>
  <div class="space-y-5">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-3 justify-between">
      <h2 class="text-sm font-semibold text-greyt uppercase tracking-wide">Tareas y objetivos</h2>
      <div class="flex items-center gap-2 flex-1 sm:flex-none justify-end">
        <div class="relative">
          <input v-model="search" type="search" placeholder="Buscar…"
            class="text-sm rounded-md border border-vac/70 pl-8 pr-2 py-1.5 outline-none focus:border-steel focus:ring-1 focus:ring-steel/40 w-40 sm:w-56" />
          <svg viewBox="0 0 24 24" class="w-4 h-4 absolute left-2.5 top-2 text-greyt" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" stroke-linecap="round" /></svg>
        </div>
        <button class="text-sm px-3 py-1.5 rounded-md bg-navy text-white hover:bg-dark transition-colors whitespace-nowrap" @click="openNew">
          ＋ Nueva tarea
        </button>
      </div>
    </div>

    <!-- Filtro por nivel -->
    <div class="flex flex-wrap items-center gap-2">
      <button v-for="lv in ALL_LEVELS" :key="lv" @click="toggleLevel(lv)"
        class="text-xs px-2.5 py-1 rounded-full border transition-colors"
        :class="activeLevels.includes(lv) ? 'border-navy bg-navy text-white' : 'border-vac/70 text-greyt hover:border-steel'">
        {{ lv }} · {{ LEVEL_LABEL[lv] }}
      </button>
      <span class="text-[11px] text-greyt ml-1">{{ filtered.length }} tareas</span>
    </div>

    <!-- Grupos -->
    <div v-for="g in grouped" :key="g.level" class="space-y-2">
      <h3 class="text-[11px] font-semibold uppercase tracking-wider text-greyt flex items-center gap-2">
        <LevelPill :level="g.level" /> {{ g.label }}
      </h3>
      <TransitionGroup name="list" tag="div" class="space-y-2 relative">
        <TaskCard v-for="t in g.tasks" :key="t.id" :task="t" @edit="openEdit" @delete="askDelete" />
      </TransitionGroup>
    </div>

    <p v-if="!filtered.length" class="text-sm text-greyt text-center py-10">
      No hay tareas que coincidan. <button class="text-steel hover:text-navy underline" @click="openNew">Crear una</button>.
    </p>

    <TaskWizard v-model="wizardOpen" />
    <TaskFormModal v-model="modalOpen" :task="editTask" />
    <ConfirmDialog v-model="confirmOpen" title="Eliminar tarea" danger confirm-text="Eliminar" :message="deleteMsg" @confirm="doDelete" />
  </div>
</template>

<script setup lang="ts">
import type { Task, Level } from '~/types'
import { LEVEL_LABEL, LEVEL_PRIORITY } from '~/utils/plan'

const { tasks, deleteTask } = usePlan()

const ALL_LEVELS: Level[] = ['L1', 'L2', 'L3', 'L0']
const activeLevels = ref<Level[]>([...ALL_LEVELS])
const search = ref('')

function toggleLevel(lv: Level) {
  activeLevels.value = activeLevels.value.includes(lv)
    ? activeLevels.value.filter(x => x !== lv)
    : [...activeLevels.value, lv]
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return tasks.value.filter(t => {
    if (!activeLevels.value.includes(t.level)) return false
    if (!q) return true
    return t.name.toLowerCase().includes(q)
      || t.code.toLowerCase().includes(q)
      || t.subtasks.some(s => s.name.toLowerCase().includes(q))
  })
})

const grouped = computed(() =>
  ALL_LEVELS
    .map(level => ({
      level,
      label: level === 'L0' ? 'Continuos' : LEVEL_PRIORITY[level],
      tasks: filtered.value.filter(t => t.level === level)
    }))
    .filter(g => g.tasks.length))

// --- wizard (crear) / modal (editar) / borrado ---
const wizardOpen = ref(false)
const modalOpen = ref(false)
const editTask = ref<Task | null>(null)
function openNew() { wizardOpen.value = true }
function openEdit(t: Task) { editTask.value = t; modalOpen.value = true }

const confirmOpen = ref(false)
const toDelete = ref<Task | null>(null)
const deleteMsg = computed(() => {
  const t = toDelete.value
  if (!t) return ''
  const n = t.subtasks.length
  return `¿Eliminar "${t.name}"?` + (n ? `\nSe borrarán también sus ${n} objetivo(s).` : '')
})
function askDelete(t: Task) { toDelete.value = t; confirmOpen.value = true }
function doDelete() { if (toDelete.value) deleteTask(toDelete.value.id) }
</script>
