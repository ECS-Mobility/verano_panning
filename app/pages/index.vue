<template>
  <div class="space-y-6">
    <!-- Banner de hoy -->
    <section class="fade-up rounded-xl bg-gradient-to-r from-dark to-navy text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-widest text-white/60">Hoy</p>
        <p class="text-2xl sm:text-3xl font-bold capitalize">{{ fmtLong(today) }}</p>
        <p class="text-sm text-white/75 mt-1">{{ sprintStatus }}</p>
      </div>
      <div class="text-right">
        <p class="text-xs uppercase tracking-widest text-white/60">Quedan</p>
        <p class="text-2xl sm:text-3xl font-bold">{{ daysLeft }} <span class="text-base font-medium text-white/70">días</span></p>
        <p class="text-sm text-white/75 mt-1">hasta el {{ fmt(settings.summerEnd) }}</p>
      </div>
    </section>

    <!-- KPIs + anillo global -->
    <section class="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <div class="lg:col-span-1 col-span-2 rounded-xl border border-vac/60 bg-white p-4 flex items-center gap-4 fade-up">
        <ProgressRing :value="overall" :size="90" />
        <div>
          <p class="text-xs uppercase tracking-wide text-greyt">Avance global</p>
          <p class="text-sm text-navy font-medium mt-1">{{ counts.completadas }}/{{ counts.total }} tareas completadas</p>
        </div>
      </div>
      <StatCard label="Tareas de foco" :value="counts.total" tone="navy" />
      <StatCard label="En curso" :value="counts.enCurso" tone="steel2" />
      <StatCard label="Completadas" :value="counts.completadas" tone="steel" />
      <StatCard label="En riesgo" :value="risk.total" tone="block" :risk="true" :hint="riskHint" />
    </section>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Sprint actual -->
      <section class="fade-up rounded-xl border border-vac/60 bg-white p-5">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-greyt uppercase tracking-wide">Sprint actual</h2>
          <NuxtLink to="/sprints" class="text-xs text-steel hover:text-navy transition-colors">Ver sprints →</NuxtLink>
        </div>

        <div v-if="curMetrics" class="flex items-center gap-4">
          <ProgressRing :value="curMetrics.pctAvg" :size="76" :color="ringColor" />
          <div class="min-w-0">
            <p class="font-semibold text-navy">Sprint S{{ curMetrics.n }}
              <span class="text-greyt font-normal text-sm">· {{ fmt(curSprint!.monday) }}–{{ fmt(curSprint!.friday) }}</span>
            </p>
            <p class="text-sm text-greyt mt-0.5">{{ curMetrics.done }}/{{ curMetrics.assigned }} objetivos hechos
              <span v-if="curMetrics.blocked" class="text-block">· {{ curMetrics.blocked }} bloqueados</span>
            </p>
          </div>
        </div>
        <p v-else class="text-sm text-greyt">{{ sprintStatus }}</p>

        <ul v-if="curSubtasks.length" class="mt-4 space-y-1.5 max-h-56 overflow-y-auto pr-1">
          <li v-for="{ sub, task } in curSubtasks" :key="sub.id" class="flex items-center gap-2 text-sm">
            <span class="text-[10px] text-greyt font-mono w-9 shrink-0">{{ task.code }}</span>
            <span class="truncate flex-1 text-navy"><span v-if="sub.milestone" class="text-steel2">◆ </span>{{ sub.name }}</span>
            <EstadoBadge :estado="sub.estado" />
            <span class="text-xs font-medium text-navy w-9 text-right">{{ sub.pct }}%</span>
          </li>
        </ul>
      </section>

      <!-- Próximos hitos -->
      <section class="fade-up rounded-xl border border-vac/60 bg-white p-5">
        <h2 class="text-sm font-semibold text-greyt uppercase tracking-wide mb-3">Próximos hitos y cierres</h2>
        <ul v-if="upcoming.length" class="space-y-2.5">
          <li v-for="m in upcoming" :key="m.sub.id" class="flex items-center gap-3">
            <div class="w-1.5 h-9 rounded-full shrink-0" :class="m.overdue ? 'bg-block' : 'bg-steel2'" />
            <div class="min-w-0 flex-1">
              <p class="text-sm text-navy truncate">◆ {{ m.label }}</p>
              <p class="text-[11px] text-greyt">{{ m.taskCode }} · {{ fmt(m.endISO) }}</p>
            </div>
            <span class="text-xs font-medium shrink-0" :class="m.overdue ? 'text-block' : 'text-greyt'">
              {{ m.overdue ? `vencido ${-m.daysLeft}d` : m.daysLeft === 0 ? 'hoy' : `en ${m.daysLeft}d` }}
            </span>
          </li>
        </ul>
        <p v-else class="text-sm text-greyt">No hay hitos pendientes próximos. 🎉</p>
      </section>
    </div>

    <!-- Avance por nivel -->
    <section class="fade-up rounded-xl border border-vac/60 bg-white p-5">
      <h2 class="text-sm font-semibold text-greyt uppercase tracking-wide mb-4">Avance por prioridad</h2>
      <div class="space-y-3">
        <div v-for="l in byLevel" :key="l.level" class="flex items-center gap-3">
          <LevelPill :level="l.level" show-label />
          <div class="flex-1 h-2.5 rounded-full bg-vac/40 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-700" :class="LEVEL_FILL[l.level]" :style="{ width: l.pct + '%' }" />
          </div>
          <span class="text-sm font-medium text-navy w-10 text-right">{{ l.pct }}%</span>
          <span class="text-[11px] text-greyt w-16 text-right">{{ l.count }} tareas</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Level } from '~/types'
import { fmt, fmtLong, daysBetween } from '~/utils/plan'

const { overall, counts, risk, currentSprint, sprintMetrics, upcoming, byLevel, today, settings, subtasksOf } = usePlan()

const curSprint = computed(() => currentSprint.value.sprint)
const curN = computed(() => (['during', 'weekend-gap'].includes(currentSprint.value.kind) ? curSprint.value?.n ?? null : null))
const curMetrics = computed(() => (curN.value ? sprintMetrics.value.find(m => m.n === curN.value) ?? null : null))
const curSubtasks = computed(() => (curN.value ? subtasksOf(curN.value) : []))

const daysLeft = computed(() => Math.max(0, daysBetween(today.value, settings.value.summerEnd)))

const sprintStatus = computed(() => {
  const { sprint, kind } = currentSprint.value
  if (kind === 'before') return `El verano arranca el ${fmt(sprint?.monday ?? settings.value.summerStart)} (Sprint S1)`
  if (kind === 'after') return 'El periodo de verano ha finalizado'
  return sprint ? `En curso · Sprint S${sprint.n}` : 'Sin sprint activo'
})

const riskHint = computed(() => {
  const r = risk.value
  const parts: string[] = []
  if (r.overdue) parts.push(`${r.overdue} vencidas`)
  if (r.dueSoon) parts.push(`${r.dueSoon} cierran ≤3d`)
  if (r.blocked) parts.push(`${r.blocked} bloqueadas`)
  return parts.join(' · ') || 'todo en plazo'
})

const ringColor = computed(() => (curMetrics.value && curMetrics.value.blocked ? '#b23a48' : '#5b7c99'))

const LEVEL_FILL: Record<Level, string> = { L0: 'bg-steel', L1: 'bg-navy', L2: 'bg-steel2', L3: 'bg-l3' }
</script>
