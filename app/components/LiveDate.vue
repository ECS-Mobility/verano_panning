<template>
  <div class="leading-tight">
    <p class="text-[11px] uppercase tracking-wide text-greyt">Hoy</p>
    <p class="text-sm text-navy font-semibold capitalize">{{ dateLabel }}</p>
    <p class="text-[11px] font-medium flex items-center gap-1.5 mt-1" :class="sprintColor">
      <span class="w-1.5 h-1.5 rounded-full" :class="dotColor" />{{ sprintLabel }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { fmtLong, fmt } from '~/utils/plan'

const { today, currentSprint } = usePlan()

const dateLabel = computed(() => fmtLong(today.value))

const sprintLabel = computed(() => {
  const { sprint, kind } = currentSprint.value
  if (!sprint) return 'Sin sprint'
  if (kind === 'before') return `Empieza ${fmt(sprint.monday)}`
  if (kind === 'after') return 'Verano finalizado'
  return `Sprint S${sprint.n}`
})

const active = computed(() => ['during', 'weekend-gap'].includes(currentSprint.value.kind))
const sprintColor = computed(() => (active.value ? 'text-steel2' : 'text-greyt'))
const dotColor = computed(() => (active.value ? 'bg-steel2' : 'bg-vac'))
</script>
