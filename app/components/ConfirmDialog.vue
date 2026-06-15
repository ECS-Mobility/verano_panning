<template>
  <BaseModal :model-value="modelValue" :title="title" max-width="max-w-md" @update:model-value="$emit('update:modelValue', $event)">
    <p class="text-sm text-greyt whitespace-pre-line">{{ message }}</p>
    <template #footer>
      <button class="text-sm px-3 py-1.5 rounded-md border border-vac/70 text-greyt hover:text-navy hover:bg-rowa transition-colors"
        @click="$emit('update:modelValue', false)">{{ cancelText }}</button>
      <button class="text-sm px-3 py-1.5 rounded-md text-white transition-colors"
        :class="danger ? 'bg-block hover:bg-block/90' : 'bg-navy hover:bg-dark'"
        @click="confirm">{{ confirmText }}</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: boolean; title?: string; message?: string; confirmText?: string; cancelText?: string; danger?: boolean
}>(), { title: '¿Confirmar?', confirmText: 'Confirmar', cancelText: 'Cancelar', danger: false })

const emit = defineEmits<{ 'update:modelValue': [boolean]; confirm: [] }>()
function confirm() { emit('confirm'); emit('update:modelValue', false) }
</script>
