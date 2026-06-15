<template>
  <header class="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-vac/60 px-4 py-2.5 flex items-center justify-between gap-3">
    <img src="/ecs-logo.png" alt="ECS Mobility" class="h-6 w-auto" />
    <div class="text-right leading-tight">
      <p class="text-[11px] text-navy font-semibold capitalize">{{ dateLabel }}</p>
      <p class="text-[10px] font-medium flex items-center justify-end gap-1" :class="active ? 'text-steel2' : 'text-greyt'">
        <span class="w-1.5 h-1.5 rounded-full" :class="active ? 'bg-steel2' : 'bg-vac'" />{{ sprintLabel }}
      </p>
    </div>
  </header>
</template>

<script setup lang="ts">
import { fmt } from '~/utils/plan'
const { today, currentSprint } = usePlan()

const dateLabel = computed(() =>
  new Date(today.value + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }))

const active = computed(() => ['during', 'weekend-gap'].includes(currentSprint.value.kind))
const sprintLabel = computed(() => {
  const { sprint, kind } = currentSprint.value
  if (!sprint) return 'Sin sprint'
  if (kind === 'before') return `Empieza ${fmt(sprint.monday)}`
  if (kind === 'after') return 'Verano finalizado'
  return `Sprint S${sprint.n}`
})
</script>
