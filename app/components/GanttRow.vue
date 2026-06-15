<template>
  <div class="gantt-grid border-b border-vac/40 hover:bg-rowa/60 transition-colors text-sm">
    <!-- Nombre -->
    <div class="px-3 py-2 flex flex-col justify-center min-w-0">
      <span :class="kind === 'step' ? 'text-navy pl-4' : 'font-semibold text-navy'" class="truncate">
        <span v-if="milestone" class="text-steel2">◆ </span>{{ name }}
      </span>
      <span v-if="resp" class="text-[11px] text-greyt truncate">{{ resp }}</span>
    </div>
    <!-- Fechas -->
    <div class="px-2 py-2 flex items-center justify-center text-[11px] text-greyt whitespace-nowrap">
      {{ fmt(start) }}<template v-if="end && end !== start">–{{ fmt(end) }}</template>
    </div>
    <!-- Estado -->
    <div class="px-2 py-2 flex items-center">
      <select v-if="editable" :value="estado" :aria-label="`Estado de ${name}`"
        class="w-full text-xs rounded-md border border-vac/70 bg-white px-1.5 py-1 outline-none focus:border-steel focus:ring-1 focus:ring-steel/40"
        @change="onEstadoChange?.(($event.target as HTMLSelectElement).value as Estado)">
        <option v-for="e in ESTADOS" :key="e" :value="e">{{ e }}</option>
      </select>
      <EstadoBadge v-else :estado="estado" />
    </div>
    <!-- % -->
    <div class="px-2 py-2 flex items-center justify-center">
      <input v-if="editable" type="number" min="0" max="100" :value="pct ?? 0" :aria-label="`Porcentaje de ${name}`"
        class="w-14 text-xs text-center rounded-md border border-vac/70 px-1 py-1 outline-none focus:border-steel focus:ring-1 focus:ring-steel/40"
        @change="onPctChange?.(Number(($event.target as HTMLInputElement).value))" />
      <span v-else class="text-xs font-medium text-navy">{{ pct == null ? '—' : pct + '%' }}</span>
    </div>
    <!-- Semanas -->
    <div v-for="(w, i) in weeks" :key="w.n" class="wk relative"
      :class="[w.vac ? 'bg-vacb' : '', w.n === currentN ? 'bg-steel/10' : '']"
      :style="{ gridColumn: META + i + 1 }" />
    <!-- Barra -->
    <div v-if="span" class="relative my-1.5 h-5 rounded-md overflow-hidden bar-grow" :class="barBg"
      :style="{ gridColumn: `${META + span[0]} / ${META + span[1]}`, gridRow: 1 }">
      <div v-if="pct != null" class="absolute inset-y-0 left-0 transition-all duration-500" :class="barFill"
        :style="{ width: pct + '%' }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Level, Estado, Sprint } from '~/types'
import { ESTADOS } from '~/types'
import { barSpan, fmt } from '~/utils/plan'

const props = defineProps<{
  kind: 'task' | 'cont' | 'step'
  level: Level
  name: string
  resp?: string
  start: string | null
  end: string | null
  estado: Estado
  pct?: number | null
  milestone?: boolean
  weeks: Sprint[]
  currentN: number | null
  editable: boolean
  onEstadoChange?: (e: Estado) => void
  onPctChange?: (p: number) => void
}>()

const META = 4
// Clases literales (Tailwind v4 solo genera lo que aparece textualmente en el código).
const BAR_BG: Record<Level, string> = { L0: 'bg-steel/25', L1: 'bg-navy/25', L2: 'bg-steel2/25', L3: 'bg-l3/25' }
const BAR_FILL: Record<Level, string> = { L0: 'bg-steel', L1: 'bg-navy', L2: 'bg-steel2', L3: 'bg-l3' }

const span = computed(() => barSpan(props.start, props.end, props.weeks))
const blocked = computed(() => props.estado === 'Bloqueada')
const barBg = computed(() => (blocked.value ? 'bg-block/25' : BAR_BG[props.level]))
const barFill = computed(() => (blocked.value ? 'bg-block' : BAR_FILL[props.level]))
</script>
