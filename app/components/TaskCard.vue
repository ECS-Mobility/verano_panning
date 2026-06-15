<template>
  <div class="rounded-xl border border-vac/60 border-l-4 bg-white overflow-hidden transition-shadow hover:shadow-md" :class="ACCENT[task.level]">
    <!-- Cabecera -->
    <div class="flex items-center gap-2.5 px-3 sm:px-4 py-3 hover:bg-rowa/40 transition-colors">
      <button class="text-greyt hover:text-navy transition-transform shrink-0" :class="open ? 'rotate-90' : ''"
        :aria-label="open ? 'Contraer' : 'Expandir'" :aria-expanded="open" @click="open = !open">
        <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
      </button>
      <LevelPill :level="task.level" />
      <span v-if="task.code" class="text-[11px] font-mono text-greyt shrink-0">{{ task.code }}</span>

      <button class="min-w-0 flex-1 text-left" @click="open = !open">
        <p class="text-sm font-semibold text-navy truncate">{{ task.name }}</p>
        <p v-if="task.resp" class="text-[11px] text-greyt truncate">{{ task.resp }} · {{ fmt(task.start) }}–{{ fmt(task.end) }}</p>
      </button>

      <!-- Estado / progreso -->
      <div class="flex items-center gap-2 shrink-0">
        <template v-if="task.type === 'cont'">
          <EstadoBadge estado="Continuo" />
        </template>
        <template v-else-if="task.subtasks.length === 0">
          <select :value="task.estado" :aria-label="`Estado de ${task.name}`"
            class="text-xs rounded-md border border-vac/70 bg-white px-1.5 py-1 outline-none focus:border-steel"
            @change="updateTask(task.id, { estado: ($event.target as HTMLSelectElement).value as Estado })">
            <option v-for="e in ESTADOS" :key="e" :value="e">{{ e }}</option>
          </select>
        </template>
        <template v-else>
          <span class="hidden sm:inline-flex items-center gap-1 text-[11px] text-greyt bg-rowa rounded-full px-2 py-0.5">
            {{ doneCount }}/{{ task.subtasks.length }} obj.
          </span>
          <span class="hidden md:inline"><EstadoBadge :estado="task.estado" /></span>
          <span class="text-sm font-bold w-10 text-right" :class="ESTADO_TEXT[task.estado]">{{ task.pct }}%</span>
        </template>

        <button class="text-greyt hover:text-steel2 p-1 transition-colors" aria-label="Editar tarea" @click="$emit('edit', task)">
          <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
        </button>
        <button class="text-greyt hover:text-block p-1 transition-colors" aria-label="Eliminar tarea" @click="$emit('delete', task)">
          <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
        </button>
      </div>
    </div>
    <!-- Barra de progreso (por estado) -->
    <div v-if="task.pct != null" class="h-1.5 bg-vac/30">
      <div class="h-full transition-all duration-500" :class="ESTADO_BAR[task.estado]" :style="{ width: (task.pct ?? 0) + '%' }" />
    </div>

    <!-- Cuerpo (objetivos) -->
    <div class="grid transition-[grid-template-rows] duration-300 ease-out" :class="open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
      <div class="overflow-hidden">
        <div class="border-t border-vac/40 bg-rowa/40 px-3 sm:px-4 py-3">
          <p v-if="task.type === 'cont'" class="text-xs text-greyt italic">Tarea continua (sin objetivos).</p>

          <div v-else>
            <p class="text-[11px] font-semibold uppercase tracking-wide text-greyt mb-2 flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-steel2" /> Objetivos · {{ doneCount }}/{{ task.subtasks.length }} hechos
            </p>

            <!-- Rail jerárquico -->
            <div class="pl-3 ml-1.5 border-l-2 border-vac/50 space-y-2">
              <div v-for="s in task.subtasks" :key="s.id"
                class="rounded-lg border border-vac/50 border-l-4 bg-white px-2.5 py-2 transition-shadow hover:shadow-sm" :class="ESTADO_BORDER[s.estado]">
                <!-- fila 1: checkbox + hito + nombre + borrar -->
                <div class="flex items-center gap-2.5">
                  <button type="button" @click="toggle(s)"
                    class="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors"
                    :class="isDone(s) ? 'bg-done border-done text-white' : 'border-vac hover:border-steel'"
                    :aria-label="isDone(s) ? 'Marcar como pendiente' : 'Marcar como hecho'" :aria-pressed="isDone(s)">
                    <svg v-if="isDone(s)" viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  </button>
                  <button type="button" class="shrink-0 text-sm leading-none transition-colors" :class="s.milestone ? 'text-steel2' : 'text-vac hover:text-greyt'"
                    :title="s.milestone ? 'Quitar hito' : 'Marcar hito'" @click="updateSubtask(task.id, s.id, { milestone: !s.milestone })">◆</button>
                  <input :value="s.name" aria-label="Nombre del objetivo"
                    class="min-w-0 flex-1 text-sm bg-transparent outline-none border-b border-transparent focus:border-steel/60 py-0.5"
                    :class="isDone(s) ? 'text-greyt line-through' : 'text-navy'"
                    @change="updateSubtask(task.id, s.id, { name: ($event.target as HTMLInputElement).value })" />
                  <button class="text-greyt hover:text-block p-0.5 transition-colors shrink-0" aria-label="Eliminar objetivo" @click="deleteSubtask(task.id, s.id)">
                    <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>
                <!-- fila 2: fechas + sprint -->
                <div class="flex flex-wrap items-center gap-2 mt-2 pl-[30px]">
                  <input type="date" :value="s.start ?? ''" aria-label="Inicio"
                    class="text-[11px] rounded border border-vac/60 px-1.5 py-0.5 text-greyt outline-none focus:border-steel"
                    @change="updateSubtask(task.id, s.id, { start: ($event.target as HTMLInputElement).value || null })" />
                  <span class="text-greyt text-[11px]">→</span>
                  <input type="date" :value="s.end ?? ''" aria-label="Fin"
                    class="text-[11px] rounded border border-vac/60 px-1.5 py-0.5 text-greyt outline-none focus:border-steel"
                    @change="updateSubtask(task.id, s.id, { end: ($event.target as HTMLInputElement).value || null })" />
                  <label class="text-[11px] text-greyt ml-auto flex items-center gap-1">Sprint
                    <select :value="s.sprintId ?? ''" aria-label="Sprint asignado"
                      class="text-xs rounded-md border border-vac/70 bg-white px-1.5 py-1 outline-none focus:border-steel"
                      @change="assignSubtaskToSprint(s.id, parseSprint(($event.target as HTMLSelectElement).value))">
                      <option value="">Backlog</option>
                      <option v-for="sp in sprints" :key="sp.n" :value="sp.n">S{{ sp.n }}{{ sp.vac ? ' (vac)' : '' }}</option>
                    </select>
                  </label>
                </div>
              </div>

              <!-- añadir objetivo -->
              <form class="flex items-center gap-2 pt-1" @submit.prevent="add">
                <span class="text-steel2 text-sm shrink-0">＋</span>
                <input v-model="newName" placeholder="Añadir objetivo / subtarea…"
                  class="flex-1 text-sm bg-transparent outline-none border-b border-vac/50 focus:border-steel py-1" />
                <button type="submit" :disabled="!newName.trim()"
                  class="text-xs px-2.5 py-1 rounded-md bg-navy text-white hover:bg-dark disabled:opacity-40 transition-colors">Añadir</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task, Subtask, Estado, Level } from '~/types'
import { ESTADOS } from '~/types'
import { fmt, ESTADO_BAR, ESTADO_BORDER } from '~/utils/plan'
import { isDone } from '~/utils/rollup'

const props = defineProps<{ task: Task; startOpen?: boolean }>()
defineEmits<{ edit: [Task]; delete: [Task] }>()

const { updateTask, updateSubtask, deleteSubtask, addSubtask, assignSubtaskToSprint, sprints } = usePlan()

const ACCENT: Record<Level, string> = { L0: 'border-l-steel', L1: 'border-l-navy', L2: 'border-l-steel2', L3: 'border-l-l3' }
const ESTADO_TEXT: Record<Estado, string> = {
  'Pendiente': 'text-greyt', 'En curso': 'text-[#8a5712]', 'Bloqueada': 'text-block', 'Completada': 'text-done', 'Continuo': 'text-steel'
}

const open = ref(props.startOpen ?? false)
const newName = ref('')
const doneCount = computed(() => props.task.subtasks.filter(isDone).length)

function toggle(s: Subtask) {
  updateSubtask(props.task.id, s.id, { estado: isDone(s) ? 'Pendiente' : 'Completada' })
}
function parseSprint(v: string): number | null { return v === '' ? null : Number(v) }
function add() {
  if (!newName.value.trim()) return
  addSubtask(props.task.id, { name: newName.value })
  newName.value = ''
  open.value = true
}
</script>
