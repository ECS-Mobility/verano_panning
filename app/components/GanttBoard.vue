<template>
  <div>
    <section class="rounded-xl border border-vac/60 overflow-x-auto bg-white fade-up">
      <div class="min-w-[920px]" :style="gridVar">
        <!-- Cabecera -->
        <div class="gantt-grid bg-dark text-white sticky top-0 z-10">
          <div class="px-3 py-2 text-xs font-semibold">Tarea / Objetivo</div>
          <div class="px-2 py-2 text-xs font-semibold text-center">Fechas</div>
          <div class="px-2 py-2 text-xs font-semibold">Estado</div>
          <div class="px-2 py-2 text-xs font-semibold text-center">%</div>
          <div v-for="w in sprints" :key="w.n" class="wk px-1 py-1 text-center"
            :class="w.n === currentN ? 'bg-navy' : w.vac ? 'bg-vac text-greyt' : ''">
            <div class="text-[10px] font-semibold leading-tight">S{{ w.n }}</div>
            <div class="text-[9px] opacity-80 leading-tight">{{ fmt(w.monday) }}</div>
          </div>
        </div>

        <!-- Grupos -->
        <template v-for="g in groups" :key="g.label">
          <div class="bg-steel text-white text-xs font-semibold px-3 py-1.5">{{ g.label }}</div>
          <template v-for="t in g.tasks" :key="t.id">
            <GanttRow
              :kind="t.type" :level="t.level" :name="t.name" :resp="t.resp"
              :start="t.start" :end="t.end" :estado="t.estado" :pct="t.pct"
              :weeks="sprints" :current-n="currentN"
              :editable="t.type === 'task' && t.subtasks.length === 0"
              :on-estado-change="(e) => updateTask(t.id, { estado: e })"
              :on-pct-change="(p) => updateTask(t.id, { pct: p })" />
            <GanttRow v-for="s in t.subtasks" :key="s.id"
              kind="step" :level="t.level" :name="s.name" :resp="s.resp" :milestone="s.milestone"
              :start="s.start" :end="s.end" :estado="s.estado" :pct="s.pct"
              :weeks="sprints" :current-n="currentN" :editable="true"
              :on-estado-change="(e) => updateSubtask(t.id, s.id, { estado: e })"
              :on-pct-change="(p) => updateSubtask(t.id, s.id, { pct: p })" />
          </template>
        </template>
      </div>
    </section>

    <!-- Leyenda -->
    <div class="flex flex-wrap items-center gap-4 mt-4 text-xs text-greyt fade-up">
      <span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded bg-navy" />L1 Alta</span>
      <span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded bg-steel2" />L2 Media</span>
      <span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded bg-l3" />L3 Baja</span>
      <span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded bg-steel" />L0 Continuo</span>
      <span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded bg-block" />Bloqueada</span>
      <span class="flex items-center gap-1.5"><i class="w-3 h-3 rounded bg-vac" />Vacaciones</span>
      <span class="ml-auto">◆ hito · el % de cada tarea se calcula desde sus objetivos</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fmt } from '~/utils/plan'

const { groups, sprints, currentSprint, updateTask, updateSubtask } = usePlan()

const currentN = computed(() =>
  ['during', 'weekend-gap'].includes(currentSprint.value.kind) ? currentSprint.value.sprint?.n ?? null : null)

const gridVar = computed(() => ({
  '--grid': `minmax(220px,1.6fr) 100px 138px 70px repeat(${sprints.value.length}, minmax(34px,1fr))`
}))
</script>
