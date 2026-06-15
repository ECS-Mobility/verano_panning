<template>
  <BaseModal :model-value="modelValue" max-width="max-w-xl" @update:model-value="close">
    <!-- Progreso -->
    <div class="flex items-center gap-1.5 mb-5">
      <template v-for="(s, idx) in stepKeys" :key="s">
        <div class="flex-1 h-1.5 rounded-full transition-colors" :class="idx <= i ? 'bg-navy' : 'bg-vac/50'" />
      </template>
    </div>
    <p class="text-[11px] uppercase tracking-widest text-greyt mb-1">Paso {{ i + 1 }} de {{ stepKeys.length }}</p>

    <Transition name="page" mode="out-in">
      <!-- 1 · Nombre -->
      <div v-if="key === 'nombre'" key="nombre" class="space-y-4">
        <h3 class="text-lg font-bold text-navy">¿Qué tarea quieres añadir?</h3>
        <div>
          <label class="block text-xs font-medium text-greyt mb-1">Nombre de la tarea *</label>
          <input ref="firstInput" v-model="form.name" type="text" placeholder="p.ej. Control volante" @keydown.enter.prevent="next"
            class="w-full text-sm rounded-md border border-vac/70 px-3 py-2 outline-none focus:border-steel focus:ring-1 focus:ring-steel/40" />
        </div>
        <div>
          <label class="block text-xs font-medium text-greyt mb-1">Código corto (opcional)</label>
          <input v-model="form.code" type="text" placeholder="CV" maxlength="8"
            class="w-32 text-sm rounded-md border border-vac/70 px-3 py-2 outline-none focus:border-steel focus:ring-1 focus:ring-steel/40 uppercase" />
        </div>
      </div>

      <!-- 2 · Prioridad y tipo -->
      <div v-else-if="key === 'detalle'" key="detalle" class="space-y-4">
        <h3 class="text-lg font-bold text-navy">¿Qué prioridad tiene?</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button v-for="opt in LEVEL_OPTS" :key="opt.level" type="button" @click="form.level = opt.level"
            class="rounded-lg border-2 p-3 text-left transition-all"
            :class="form.level === opt.level ? 'border-navy bg-navy/5' : 'border-vac/60 hover:border-steel'">
            <span class="block w-4 h-4 rounded mb-2" :class="opt.swatch" />
            <span class="block text-sm font-semibold text-navy">{{ opt.level }}</span>
            <span class="block text-[11px] text-greyt">{{ opt.label }}</span>
          </button>
        </div>

        <div>
          <label class="block text-xs font-medium text-greyt mb-1">Tipo</label>
          <div class="flex rounded-lg border border-vac/60 overflow-hidden w-full max-w-sm">
            <button type="button" @click="form.type = 'task'" class="flex-1 text-sm py-2 transition-colors"
              :class="form.type === 'task' ? 'bg-navy text-white' : 'text-greyt hover:bg-rowa'">Con objetivos</button>
            <button type="button" @click="form.type = 'cont'" class="flex-1 text-sm py-2 transition-colors"
              :class="form.type === 'cont' ? 'bg-navy text-white' : 'text-greyt hover:bg-rowa'">Continua (sin %)</button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-greyt mb-1">Responsable</label>
          <input v-model="form.resp" type="text"
            class="w-48 text-sm rounded-md border border-vac/70 px-3 py-2 outline-none focus:border-steel focus:ring-1 focus:ring-steel/40" />
        </div>
      </div>

      <!-- 3 · Fechas -->
      <div v-else-if="key === 'fechas'" key="fechas" class="space-y-4">
        <h3 class="text-lg font-bold text-navy">¿Para cuándo?</h3>
        <p class="text-xs text-greyt">Opcional. Define el rango de la tarea en el calendario del verano.</p>
        <div class="flex gap-3">
          <div>
            <label class="block text-xs font-medium text-greyt mb-1">Inicio</label>
            <input v-model="form.start" type="date"
              class="text-sm rounded-md border border-vac/70 px-3 py-2 outline-none focus:border-steel focus:ring-1 focus:ring-steel/40" />
          </div>
          <div>
            <label class="block text-xs font-medium text-greyt mb-1">Fin</label>
            <input v-model="form.end" type="date"
              class="text-sm rounded-md border border-vac/70 px-3 py-2 outline-none focus:border-steel focus:ring-1 focus:ring-steel/40" />
          </div>
        </div>
      </div>

      <!-- 4 · Objetivos -->
      <div v-else-if="key === 'objetivos'" key="objetivos" class="space-y-3">
        <h3 class="text-lg font-bold text-navy">Añade los objetivos</h3>
        <p class="text-xs text-greyt">Las subtareas que componen la tarea. Puedes añadir varias (o ninguna y hacerlo luego).</p>

        <TransitionGroup name="list" tag="div" class="space-y-2 relative">
          <div v-for="(o, idx) in objetivos" :key="o.key" class="flex items-center gap-2 bg-rowa/50 rounded-lg px-2.5 py-1.5">
            <button type="button" class="text-sm" :class="o.milestone ? 'text-steel2' : 'text-vac hover:text-greyt'"
              :title="o.milestone ? 'Hito' : 'Marcar hito'" @click="o.milestone = !o.milestone">◆</button>
            <span class="flex-1 text-sm text-navy truncate">{{ o.name }}</span>
            <button type="button" class="text-greyt hover:text-block" @click="objetivos.splice(idx, 1)" aria-label="Quitar">✕</button>
          </div>
        </TransitionGroup>

        <form class="flex items-center gap-2" @submit.prevent="addObjetivo">
          <span class="text-steel2">＋</span>
          <input v-model="newObj" placeholder="Nombre del objetivo y Enter…"
            class="flex-1 text-sm bg-transparent outline-none border-b border-vac/50 focus:border-steel py-1.5" />
          <button type="submit" :disabled="!newObj.trim()"
            class="text-xs px-2.5 py-1 rounded-md bg-steel2 text-white hover:bg-steel disabled:opacity-40 transition-colors">Añadir</button>
        </form>
      </div>

      <!-- 5 · Revisar -->
      <div v-else key="revisar" class="space-y-3">
        <h3 class="text-lg font-bold text-navy">Revisa y crea</h3>
        <div class="rounded-lg border border-vac/60 divide-y divide-vac/40 text-sm">
          <div class="flex justify-between px-3 py-2"><span class="text-greyt">Tarea</span><span class="text-navy font-medium text-right">{{ form.name || '—' }}</span></div>
          <div class="flex justify-between px-3 py-2"><span class="text-greyt">Prioridad / tipo</span><span class="text-navy text-right">{{ form.level }} · {{ form.type === 'cont' ? 'Continua' : 'Con objetivos' }}</span></div>
          <div class="flex justify-between px-3 py-2"><span class="text-greyt">Responsable</span><span class="text-navy text-right">{{ form.resp || '—' }}</span></div>
          <div class="flex justify-between px-3 py-2"><span class="text-greyt">Fechas</span><span class="text-navy text-right">{{ form.start || '—' }} → {{ form.end || '—' }}</span></div>
          <div v-if="form.type === 'task'" class="flex justify-between px-3 py-2"><span class="text-greyt">Objetivos</span><span class="text-navy text-right">{{ objetivos.length }}</span></div>
        </div>
      </div>
    </Transition>

    <template #footer>
      <button type="button" v-if="i > 0" class="text-sm px-3 py-1.5 rounded-md border border-vac/70 text-greyt hover:text-navy hover:bg-rowa transition-colors mr-auto" @click="back">← Atrás</button>
      <button type="button" class="text-sm px-3 py-1.5 rounded-md border border-vac/70 text-greyt hover:text-navy hover:bg-rowa transition-colors" @click="close">Cancelar</button>
      <button v-if="!isLast" type="button" class="text-sm px-4 py-1.5 rounded-md bg-navy text-white hover:bg-dark disabled:opacity-40 transition-colors" :disabled="!canNext" @click="next">Siguiente →</button>
      <button v-else type="button" class="text-sm px-4 py-1.5 rounded-md bg-done text-white hover:opacity-90 transition-opacity" @click="finish">✓ Crear tarea</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import type { Level, TaskType } from '~/types'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
const { createTask, addSubtask, settings } = usePlan()

const LEVEL_OPTS: { level: Level; label: string; swatch: string }[] = [
  { level: 'L1', label: 'Alta', swatch: 'bg-navy' },
  { level: 'L2', label: 'Media', swatch: 'bg-steel2' },
  { level: 'L3', label: 'Baja', swatch: 'bg-l3' },
  { level: 'L0', label: 'Continuo', swatch: 'bg-steel' }
]

let seq = 0
const blank = () => ({ name: '', code: '', resp: settings.value.defaultResp, level: 'L2' as Level, type: 'task' as TaskType, start: '', end: '' })
const form = reactive(blank())
const objetivos = ref<{ key: number; name: string; milestone: boolean }[]>([])
const newObj = ref('')
const i = ref(0)
const firstInput = ref<HTMLInputElement | null>(null)

const stepKeys = computed(() => ['nombre', 'detalle', 'fechas', ...(form.type === 'task' ? ['objetivos'] : []), 'revisar'])
const key = computed(() => stepKeys.value[i.value])
const isLast = computed(() => i.value === stepKeys.value.length - 1)
const canNext = computed(() => (key.value === 'nombre' ? form.name.trim().length > 0 : true))

function addObjetivo() {
  if (!newObj.value.trim()) return
  objetivos.value.push({ key: seq++, name: newObj.value.trim(), milestone: false })
  newObj.value = ''
}
function next() { if (canNext.value && !isLast.value) i.value++ }
function back() { if (i.value > 0) i.value-- }

function finish() {
  if (!form.name.trim()) { i.value = 0; return }
  const id = createTask({
    name: form.name, code: form.code, resp: form.resp, level: form.level, type: form.type,
    start: form.start || null, end: form.end || null
  })
  if (form.type === 'task') for (const o of objetivos.value) addSubtask(id, { name: o.name, milestone: o.milestone })
  close()
}

function close() { emit('update:modelValue', false) }

watch(() => props.modelValue, (open) => {
  if (!open) return
  Object.assign(form, blank())
  objetivos.value = []
  newObj.value = ''
  i.value = 0
  nextTick(() => firstInput.value?.focus())
})
</script>
