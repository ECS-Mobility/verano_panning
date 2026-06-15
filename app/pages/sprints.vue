<template>
  <div class="space-y-5">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-3 justify-between">
      <div>
        <h2 class="text-sm font-semibold text-greyt uppercase tracking-wide">Sprints semanales</h2>
        <p class="text-[11px] text-greyt mt-0.5">Cumplimiento hasta hoy: <span class="font-semibold text-navy">{{ cumplimiento }}%</span></p>
      </div>
      <button class="text-xs px-3 py-1.5 rounded-md border border-vac/70 text-steel hover:text-navy hover:bg-rowa transition-colors"
        @click="autoAssignSprints">↻ Auto-asignar por fechas</button>
    </div>

    <!-- Tira resumen -->
    <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
      <div v-for="m in sprintMetrics" :key="m.n" class="flex flex-col items-center gap-1 shrink-0 w-12">
        <div class="w-full h-1.5 rounded-full" :class="[DOT[m.status], m.n === currentN ? 'glow-current' : '']" />
        <span class="text-[10px]" :class="m.n === currentN ? 'text-navy font-bold' : 'text-greyt'">S{{ m.n }}</span>
      </div>
    </div>

    <!-- Board -->
    <div class="flex gap-3 overflow-x-auto pb-3">
      <!-- Backlog -->
      <div class="shrink-0 w-64 rounded-xl border border-vac/60 border-dashed bg-rowa/40 flex flex-col">
        <div class="px-3 py-2.5 border-b border-vac/40">
          <p class="text-sm font-semibold text-greyt">Backlog</p>
          <p class="text-[11px] text-greyt">{{ backlog.length }} sin asignar</p>
        </div>
        <div class="p-2 space-y-2 overflow-y-auto" style="max-height: 60vh">
          <SprintItem v-for="{ sub, task } in backlog" :key="sub.id" :sub="sub" :code="task.code" />
          <p v-if="!backlog.length" class="text-[11px] text-greyt italic px-1 py-2">Todo asignado.</p>
        </div>
      </div>

      <!-- Sprints -->
      <div v-for="sp in sprints" :key="sp.n"
        class="shrink-0 w-64 rounded-xl border border-vac/60 border-t-4 bg-white flex flex-col"
        :class="[ACCENT[metric(sp.n).status], sp.n === currentN ? 'glow-current' : '', sp.vac ? 'opacity-90' : '']">
        <div class="px-3 py-2.5 border-b border-vac/40 flex items-center justify-between gap-2">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-navy flex items-center gap-1.5">
              S{{ sp.n }}
              <span v-if="sp.n === currentN" class="text-[9px] font-bold text-white bg-navy rounded px-1 py-0.5">HOY</span>
              <span v-if="sp.vac" class="text-[9px] text-greyt bg-vac/60 rounded px-1 py-0.5">VAC</span>
            </p>
            <p class="text-[11px] text-greyt">{{ fmt(sp.monday) }}–{{ fmt(sp.friday) }}</p>
          </div>
          <ProgressRing :value="metric(sp.n).pctAvg" :size="42" :stroke="5" :color="RING[metric(sp.n).status]" />
        </div>
        <div class="px-3 py-1.5 text-[11px] text-greyt border-b border-vac/30 flex items-center gap-2">
          <span>{{ metric(sp.n).done }}/{{ metric(sp.n).assigned }} hechos</span>
          <span v-if="metric(sp.n).carryOver" class="text-block font-medium">· {{ metric(sp.n).carryOver }} arrastrados</span>
        </div>
        <div class="p-2 space-y-2 overflow-y-auto" style="max-height: 55vh">
          <SprintItem v-for="{ sub, task } in items(sp.n)" :key="sub.id" :sub="sub" :code="task.code" />
          <p v-if="!items(sp.n).length" class="text-[11px] text-greyt italic px-1 py-2">Sin objetivos.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SprintStatus, SprintMetrics } from '~/utils/sprints'
import { summerCumplimiento } from '~/utils/sprints'
import { fmt } from '~/utils/plan'

const { sprints, sprintMetrics, subtasksOf, currentSprint, autoAssignSprints } = usePlan()

const currentN = computed(() =>
  ['during', 'weekend-gap'].includes(currentSprint.value.kind) ? currentSprint.value.sprint?.n ?? null : null)

const backlog = computed(() => subtasksOf(null))
function items(n: number) { return subtasksOf(n) }

const EMPTY: SprintMetrics = { n: 0, assigned: 0, done: 0, inProgress: 0, pending: 0, blocked: 0, pctAvg: 0, pctByCount: 0, carryOver: 0, cumplimiento: null, status: 'empty' }
function metric(n: number): SprintMetrics { return sprintMetrics.value.find(m => m.n === n) ?? EMPTY }

const cumplimiento = computed(() => summerCumplimiento(sprintMetrics.value, currentN.value ?? sprints.value.length))

const DOT: Record<SprintStatus, string> = { active: 'bg-navy', completed: 'bg-steel', 'at-risk': 'bg-block', upcoming: 'bg-steel2', empty: 'bg-vac', vacation: 'bg-vac' }
const ACCENT: Record<SprintStatus, string> = { active: 'border-t-navy', completed: 'border-t-steel', 'at-risk': 'border-t-block', upcoming: 'border-t-steel2', empty: 'border-t-vac', vacation: 'border-t-vac' }
const RING: Record<SprintStatus, string> = { active: '#283b4c', completed: '#4a6580', 'at-risk': '#b23a48', upcoming: '#5b7c99', empty: '#9baab8', vacation: '#9baab8' }
</script>
