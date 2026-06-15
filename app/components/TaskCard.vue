<template>
  <div class="rounded-xl border border-vac/60 bg-white overflow-hidden">
    <!-- Cabecera -->
    <div class="flex items-center gap-3 px-3 sm:px-4 py-3 hover:bg-rowa/50 transition-colors">
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
          <input type="number" min="0" max="100" :value="task.pct ?? 0" :aria-label="`% de ${task.name}`"
            class="w-14 text-xs text-center rounded-md border border-vac/70 px-1 py-1 outline-none focus:border-steel"
            @change="updateTask(task.id, { pct: Number(($event.target as HTMLInputElement).value) })" />
        </template>
        <template v-else>
          <span class="hidden sm:inline"><EstadoBadge :estado="task.estado" /></span>
          <span class="text-sm font-bold text-navy w-10 text-right">{{ task.pct }}%</span>
        </template>

        <button class="text-greyt hover:text-navy p-1 transition-colors" aria-label="Editar tarea" @click="$emit('edit', task)">
          <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
        </button>
        <button class="text-greyt hover:text-block p-1 transition-colors" aria-label="Eliminar tarea" @click="$emit('delete', task)">
          <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
        </button>
      </div>
    </div>
    <!-- Barra de progreso -->
    <div v-if="task.pct != null" class="h-1 bg-vac/30">
      <div class="h-full transition-all duration-500" :class="task.estado === 'Bloqueada' ? 'bg-block' : 'bg-steel2'" :style="{ width: (task.pct ?? 0) + '%' }" />
    </div>

    <!-- Cuerpo (subtareas) -->
    <div class="grid transition-[grid-template-rows] duration-300 ease-out" :class="open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
      <div class="overflow-hidden">
        <div class="border-t border-vac/40 bg-rowa/30 px-3 sm:px-4 py-3">
          <p v-if="task.type === 'cont'" class="text-xs text-greyt italic">Tarea continua (sin objetivos).</p>

          <div v-else class="space-y-2">
            <div v-for="s in task.subtasks" :key="s.id"
              class="grid grid-cols-[1fr] sm:grid-cols-[1.6fr_auto_auto_auto_auto_auto] gap-2 items-center bg-white rounded-lg border border-vac/50 px-2.5 py-2">
              <!-- nombre + hito -->
              <div class="flex items-center gap-1.5 min-w-0">
                <button class="shrink-0 text-sm leading-none transition-colors" :class="s.milestone ? 'text-steel2' : 'text-vac hover:text-greyt'"
                  :aria-label="s.milestone ? 'Quitar hito' : 'Marcar hito'" :title="s.milestone ? 'Hito' : 'Marcar como hito'"
                  @click="updateSubtask(task.id, s.id, { milestone: !s.milestone })">◆</button>
                <input :value="s.name" :aria-label="`Nombre del objetivo`"
                  class="min-w-0 flex-1 text-sm text-navy bg-transparent outline-none border-b border-transparent focus:border-steel/60 py-0.5"
                  @change="updateSubtask(task.id, s.id, { name: ($event.target as HTMLInputElement).value })" />
              </div>
              <!-- fechas -->
              <input type="date" :value="s.start ?? ''" aria-label="Inicio"
                class="text-[11px] rounded border border-vac/60 px-1 py-0.5 text-greyt outline-none focus:border-steel"
                @change="updateSubtask(task.id, s.id, { start: ($event.target as HTMLInputElement).value || null })" />
              <input type="date" :value="s.end ?? ''" aria-label="Fin"
                class="text-[11px] rounded border border-vac/60 px-1 py-0.5 text-greyt outline-none focus:border-steel"
                @change="updateSubtask(task.id, s.id, { end: ($event.target as HTMLInputElement).value || null })" />
              <!-- estado -->
              <select :value="s.estado" aria-label="Estado del objetivo"
                class="text-xs rounded-md border border-vac/70 bg-white px-1.5 py-1 outline-none focus:border-steel"
                @change="updateSubtask(task.id, s.id, { estado: ($event.target as HTMLSelectElement).value as Estado })">
                <option v-for="e in ESTADOS" :key="e" :value="e">{{ e }}</option>
              </select>
              <!-- sprint + pct -->
              <select :value="s.sprintId ?? ''" aria-label="Sprint asignado"
                class="text-xs rounded-md border border-vac/70 bg-white px-1.5 py-1 outline-none focus:border-steel"
                @change="assignSubtaskToSprint(s.id, parseSprint(($event.target as HTMLSelectElement).value))">
                <option value="">Backlog</option>
                <option v-for="sp in sprints" :key="sp.n" :value="sp.n">S{{ sp.n }}{{ sp.vac ? ' (vac)' : '' }}</option>
              </select>
              <div class="flex items-center gap-1">
                <input type="number" min="0" max="100" :value="s.pct" aria-label="% del objetivo"
                  class="w-14 text-xs text-center rounded-md border border-vac/70 px-1 py-1 outline-none focus:border-steel"
                  @change="updateSubtask(task.id, s.id, { pct: Number(($event.target as HTMLInputElement).value) })" />
                <button class="text-greyt hover:text-block p-1 transition-colors" aria-label="Eliminar objetivo" @click="deleteSubtask(task.id, s.id)">
                  <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
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
</template>

<script setup lang="ts">
import type { Task, Estado } from '~/types'
import { ESTADOS } from '~/types'
import { fmt } from '~/utils/plan'

const props = defineProps<{ task: Task; startOpen?: boolean }>()
defineEmits<{ edit: [Task]; delete: [Task] }>()

const { updateTask, updateSubtask, deleteSubtask, addSubtask, assignSubtaskToSprint, sprints } = usePlan()

const open = ref(props.startOpen ?? false)
const newName = ref('')

function parseSprint(v: string): number | null { return v === '' ? null : Number(v) }

function add() {
  if (!newName.value.trim()) return
  addSubtask(props.task.id, { name: newName.value })
  newName.value = ''
  open.value = true
}
</script>
