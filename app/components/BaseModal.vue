<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-dark/40" @click="close" />
        <div ref="panel" class="modal-panel relative bg-white rounded-xl shadow-xl w-full overflow-y-auto"
          :class="maxWidth" style="max-height: 90vh" role="dialog" aria-modal="true" tabindex="-1">
          <div v-if="title || $slots.header" class="flex items-center justify-between px-5 py-3 border-b border-vac/50 sticky top-0 bg-white">
            <h3 class="font-semibold text-navy">{{ title }}</h3>
            <button class="text-greyt hover:text-block transition-colors text-lg leading-none" @click="close" aria-label="Cerrar">✕</button>
          </div>
          <div class="p-5"><slot /></div>
          <div v-if="$slots.footer" class="px-5 py-3 border-t border-vac/50 flex justify-end gap-2 sticky bottom-0 bg-white">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ modelValue: boolean; title?: string; maxWidth?: string }>(), {
  maxWidth: 'max-w-lg'
})
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
const panel = ref<HTMLElement | null>(null)

function close() { emit('update:modelValue', false) }
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close() }

watch(() => props.modelValue, (open) => {
  if (typeof document === 'undefined') return
  if (open) {
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    nextTick(() => panel.value?.focus())
  } else {
    document.removeEventListener('keydown', onKey)
    document.body.style.overflow = ''
  }
})
onUnmounted(() => {
  if (typeof document !== 'undefined') { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
})
</script>
