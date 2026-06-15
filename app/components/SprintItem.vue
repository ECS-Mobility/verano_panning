<template>
  <div class="rounded-lg border border-vac/50 bg-white px-2.5 py-2 text-sm">
    <div class="flex items-start gap-1.5">
      <span class="w-2 h-2 rounded-full mt-1.5 shrink-0" :class="ESTADO_DOT[sub.estado]" />
      <div class="min-w-0 flex-1">
        <p class="text-navy leading-tight truncate"><span v-if="sub.milestone" class="text-steel2">◆ </span>{{ sub.name }}</p>
        <p class="text-[10px] text-greyt font-mono">{{ code }} · {{ sub.pct }}%</p>
      </div>
    </div>
    <div class="flex items-center gap-1 mt-1.5">
      <select :value="sub.sprintId ?? ''" aria-label="Mover a sprint"
        class="flex-1 text-[11px] rounded border border-vac/60 bg-white px-1 py-0.5 text-greyt outline-none focus:border-steel"
        @change="assignSubtaskToSprint(sub.id, parse(($event.target as HTMLSelectElement).value))">
        <option value="">Backlog</option>
        <option v-for="sp in sprints" :key="sp.n" :value="sp.n">S{{ sp.n }}{{ sp.vac ? ' (vac)' : '' }}</option>
      </select>
      <span v-if="warn" :title="warn" class="text-block text-xs shrink-0" aria-label="Aviso">⚠</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Subtask } from '~/types'
import { ESTADO_DOT, d } from '~/utils/plan'

const props = defineProps<{ sub: Subtask; code: string }>()
const { sprints, assignSubtaskToSprint } = usePlan()

function parse(v: string): number | null { return v === '' ? null : Number(v) }

// Aviso si las fechas de la subtarea caen fuera de la semana del sprint asignado.
const warn = computed(() => {
  const s = props.sub
  if (s.sprintId == null) return ''
  const sp = sprints.value.find(x => x.n === s.sprintId)
  if (!sp) return ''
  if (sp.vac) return 'Semana de vacaciones'
  if (s.start && s.end) {
    const overlaps = d(s.start) <= d(sp.friday) && d(s.end) >= d(sp.monday)
    if (!overlaps) return 'Fechas fuera de la semana del sprint'
  }
  return ''
})
</script>
