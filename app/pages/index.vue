<template>
  <div class="space-y-6">
    <!-- Banner de hoy -->
    <section class="fade-up rounded-xl bg-gradient-to-r from-dark to-navy text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
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
      <div class="lg:col-span-1 col-span-2 rounded-xl border border-vac/60 bg-white p-4 flex items-center gap-4 fade-up shadow-sm">
        <ProgressRing :value="overall" :size="86" :color="overall >= 67 ? '#3f9a73' : overall >= 34 ? '#5b7c99' : '#283b4c'" />
        <div>
          <p class="text-xs uppercase tracking-wide text-greyt">Avance global</p>
          <p class="text-sm text-navy font-medium mt-1">{{ counts.completadas }}/{{ counts.total }} tareas hechas</p>
        </div>
      </div>
      <StatCard label="Tareas de foco" :value="counts.total" tone="navy" :icon="ICON.layers" />
      <StatCard label="En curso" :value="counts.enCurso" tone="steel2" :icon="ICON.activity" />
      <StatCard label="Completadas" :value="counts.completadas" tone="steel" :icon="ICON.check" />
      <StatCard label="En riesgo" :value="risk.total" tone="block" :risk="true" :hint="riskHint" :icon="ICON.alert" />
    </section>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Sprint actual -->
      <section class="fade-up rounded-xl border border-vac/60 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-greyt uppercase tracking-wide flex items-center gap-2"><span class="w-1 h-4 rounded-full bg-steel2" />Sprint actual</h2>
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
            <span class="truncate flex-1" :class="sub.estado === 'Completada' ? 'text-greyt line-through' : 'text-navy'">
              <span v-if="sub.milestone" class="text-steel2">◆ </span>{{ sub.name }}
            </span>
            <EstadoBadge :estado="sub.estado" />
          </li>
        </ul>
      </section>

      <!-- Próximos hitos -->
      <section class="fade-up rounded-xl border border-vac/60 bg-white p-5 shadow-sm">
        <h2 class="text-sm font-semibold text-greyt uppercase tracking-wide mb-1 flex items-center gap-2"><span class="w-1 h-4 rounded-full bg-prog" />Próximos hitos y cierres</h2>
        <p class="text-[11px] text-greyt mb-3">Próximas 2 semanas</p>
        <ul v-if="upcoming.length" class="space-y-2.5">
          <li v-for="m in upcoming" :key="m.sub.id" class="flex items-center gap-3">
            <div class="w-1.5 h-9 rounded-full shrink-0" :class="m.overdue ? 'bg-block' : 'bg-steel2'" />
            <div class="min-w-0 flex-1">
              <p class="text-sm text-navy truncate"><span class="text-steel2">◆</span> {{ m.label }}</p>
              <p class="text-[11px] text-greyt">{{ m.taskCode }} · {{ fmt(m.endISO) }}</p>
            </div>
            <span class="text-xs font-medium shrink-0" :class="m.overdue ? 'text-block' : 'text-greyt'">
              {{ m.overdue ? `vencido ${-m.daysLeft}d` : m.daysLeft === 0 ? 'hoy' : `en ${m.daysLeft}d` }}
            </span>
          </li>
        </ul>
        <p v-else class="text-sm text-greyt">No hay hitos en las próximas 2 semanas. 🎉</p>
      </section>
    </div>

    <!-- Resumen por semana -->
    <section class="fade-up rounded-xl border border-vac/60 bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between mb-1">
        <h2 class="text-sm font-semibold text-greyt uppercase tracking-wide flex items-center gap-2"><span class="w-1 h-4 rounded-full bg-done" />Resumen por semana</h2>
        <span class="text-[11px] text-greyt">{{ cumplimiento }}% cumplimiento hasta hoy</span>
      </div>
      <p class="text-[11px] text-greyt mb-4">% completado y objetivos hechos en cada sprint semanal</p>
      <div class="flex gap-2 overflow-x-auto pb-1">
        <div v-for="m in sprintMetrics" :key="m.n" class="shrink-0 w-[92px] rounded-lg border p-2.5 text-center transition-all"
          :class="m.n === currentN ? 'border-navy bg-navy/5 ring-1 ring-navy/30' : isVac(m.n) ? 'border-vac/60 bg-vacb/60' : 'border-vac/60'">
          <p class="text-xs font-bold" :class="m.n === currentN ? 'text-navy' : 'text-greyt'">S{{ m.n }}</p>
          <p class="text-[9px] text-greyt">{{ fmt(mondayOf(m.n)) }}</p>
          <div class="my-2 h-1.5 rounded-full bg-vac/40 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-700" :class="BAR_STATUS[m.status]" :style="{ width: m.pctAvg + '%' }" />
          </div>
          <p class="text-sm font-bold text-navy">{{ m.pctAvg }}%</p>
          <p class="text-[9px] text-greyt">{{ isVac(m.n) ? 'vacaciones' : m.assigned ? `${m.done}/${m.assigned} obj.` : 'sin objetivos' }}</p>
        </div>
      </div>
    </section>

    <!-- Avance por nivel -->
    <section class="fade-up rounded-xl border border-vac/60 bg-white p-5 shadow-sm">
      <h2 class="text-sm font-semibold text-greyt uppercase tracking-wide mb-4 flex items-center gap-2"><span class="w-1 h-4 rounded-full bg-navy" />Avance por prioridad</h2>
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
import type { SprintStatus } from '~/utils/sprints'
import { summerCumplimiento } from '~/utils/sprints'
import { fmt, fmtLong, daysBetween } from '~/utils/plan'

const { overall, counts, risk, currentSprint, sprintMetrics, sprints, upcoming, byLevel, today, settings, subtasksOf } = usePlan()

const sprintByN = computed(() => new Map(sprints.value.map(s => [s.n, s])))
function mondayOf(n: number) { return sprintByN.value.get(n)?.monday ?? null }
function isVac(n: number) { return sprintByN.value.get(n)?.vac ?? false }

const curSprint = computed(() => currentSprint.value.sprint)
const curN = computed(() => (['during', 'weekend-gap'].includes(currentSprint.value.kind) ? curSprint.value?.n ?? null : null))
const currentN = curN
const curMetrics = computed(() => (curN.value ? sprintMetrics.value.find(m => m.n === curN.value) ?? null : null))
const curSubtasks = computed(() => (curN.value ? subtasksOf(curN.value) : []))

const daysLeft = computed(() => Math.max(0, daysBetween(today.value, settings.value.summerEnd)))
const cumplimiento = computed(() => summerCumplimiento(sprintMetrics.value, curN.value ?? sprintMetrics.value.length))

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
const BAR_STATUS: Record<SprintStatus, string> = { active: 'bg-navy', completed: 'bg-done', 'at-risk': 'bg-block', upcoming: 'bg-steel2', empty: 'bg-vac/60', vacation: 'bg-vac/60' }

const ICON = {
  layers: 'M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  check: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01'
}
</script>
