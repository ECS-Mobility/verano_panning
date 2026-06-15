<template>
  <div class="text-right leading-tight">
    <p class="text-xs sm:text-sm text-navy font-medium capitalize">{{ dateLabel }}</p>
    <p class="text-[11px] font-semibold flex items-center justify-end gap-1.5" :class="sprintColor">
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
  if (kind === 'before') return `Empieza el ${fmt(sprint.monday)}`
  if (kind === 'after') return 'Verano finalizado'
  return `Sprint S${sprint.n} · ${fmt(sprint.monday)}–${fmt(sprint.friday)}`
})

const active = computed(() => ['during', 'weekend-gap'].includes(currentSprint.value.kind))
const sprintColor = computed(() => (active.value ? 'text-steel2' : 'text-greyt'))
const dotColor = computed(() => (active.value ? 'bg-steel2' : 'bg-vac'))
</script>
