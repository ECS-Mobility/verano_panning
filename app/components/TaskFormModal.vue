<template>
  <BaseModal :model-value="modelValue" :title="task ? 'Editar tarea' : 'Nueva tarea'"
    @update:model-value="$emit('update:modelValue', $event)">
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-xs font-medium text-greyt mb-1">Nombre *</label>
        <input v-model="form.name" type="text" required placeholder="Nombre de la tarea"
          class="w-full text-sm rounded-md border border-vac/70 px-2.5 py-1.5 outline-none focus:border-steel focus:ring-1 focus:ring-steel/40" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-greyt mb-1">Código</label>
          <input v-model="form.code" type="text" placeholder="CV, PAC…"
            class="w-full text-sm rounded-md border border-vac/70 px-2.5 py-1.5 outline-none focus:border-steel focus:ring-1 focus:ring-steel/40" />
        </div>
        <div>
          <label class="block text-xs font-medium text-greyt mb-1">Responsable</label>
          <input v-model="form.resp" type="text" placeholder="Erik"
            class="w-full text-sm rounded-md border border-vac/70 px-2.5 py-1.5 outline-none focus:border-steel focus:ring-1 focus:ring-steel/40" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-greyt mb-1">Nivel / prioridad</label>
          <select v-model="form.level"
            class="w-full text-sm rounded-md border border-vac/70 bg-white px-2.5 py-1.5 outline-none focus:border-steel focus:ring-1 focus:ring-steel/40">
            <option value="L1">L1 · Alta</option>
            <option value="L2">L2 · Media</option>
            <option value="L3">L3 · Baja</option>
            <option value="L0">L0 · Continuo</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-greyt mb-1">Tipo</label>
          <select v-model="form.type"
            class="w-full text-sm rounded-md border border-vac/70 bg-white px-2.5 py-1.5 outline-none focus:border-steel focus:ring-1 focus:ring-steel/40">
            <option value="task">Tarea con objetivos</option>
            <option value="cont">Continuo (sin %)</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-greyt mb-1">Inicio</label>
          <input v-model="form.start" type="date"
            class="w-full text-sm rounded-md border border-vac/70 px-2.5 py-1.5 outline-none focus:border-steel focus:ring-1 focus:ring-steel/40" />
        </div>
        <div>
          <label class="block text-xs font-medium text-greyt mb-1">Fin</label>
          <input v-model="form.end" type="date"
            class="w-full text-sm rounded-md border border-vac/70 px-2.5 py-1.5 outline-none focus:border-steel focus:ring-1 focus:ring-steel/40" />
        </div>
      </div>

      <div>
        <label class="block text-xs font-medium text-greyt mb-1">Subgrupo (opcional)</label>
        <input v-model="form.groupLabel" type="text" placeholder="p.ej. Gobierno del dato…"
          class="w-full text-sm rounded-md border border-vac/70 px-2.5 py-1.5 outline-none focus:border-steel focus:ring-1 focus:ring-steel/40" />
      </div>

      <p v-if="error" class="text-xs text-block">{{ error }}</p>
    </form>

    <template #footer>
      <button type="button" class="text-sm px-3 py-1.5 rounded-md border border-vac/70 text-greyt hover:text-navy hover:bg-rowa transition-colors"
        @click="$emit('update:modelValue', false)">Cancelar</button>
      <button type="button" class="text-sm px-3 py-1.5 rounded-md bg-navy text-white hover:bg-dark transition-colors" @click="submit">
        {{ task ? 'Guardar' : 'Crear tarea' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import type { Task, Level, TaskType } from '~/types'

const props = defineProps<{ modelValue: boolean; task: Task | null }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const { createTask, updateTask, settings } = usePlan()

const blank = () => ({
  name: '', code: '', resp: settings.value.defaultResp,
  level: 'L2' as Level, type: 'task' as TaskType,
  start: '' as string, end: '' as string, groupLabel: ''
})
const form = reactive(blank())
const error = ref('')

watch(() => props.modelValue, (open) => {
  if (!open) return
  error.value = ''
  const t = props.task
  if (t) {
    Object.assign(form, {
      name: t.name, code: t.code, resp: t.resp, level: t.level, type: t.type,
      start: t.start ?? '', end: t.end ?? '', groupLabel: t.groupLabel ?? ''
    })
  } else {
    Object.assign(form, blank())
  }
})

function submit() {
  if (!form.name.trim()) { error.value = 'El nombre es obligatorio'; return }
  const payload = {
    name: form.name, code: form.code, resp: form.resp, level: form.level, type: form.type,
    start: form.start || null, end: form.end || null, groupLabel: form.groupLabel || undefined
  }
  if (props.task) updateTask(props.task.id, payload)
  else createTask(payload)
  emit('update:modelValue', false)
}
</script>
