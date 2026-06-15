<template>
  <span class="inline-flex items-center gap-1.5 text-xs" :class="textClass">
    <span class="w-2 h-2 rounded-full" :class="ESTADO_DOT[estado]" />{{ estado }}
  </span>
</template>

<script setup lang="ts">
import type { Estado } from '~/types'
import { ESTADO_DOT } from '~/utils/plan'

const props = defineProps<{ estado: Estado }>()
const textClass = computed(() => (props.estado === 'Bloqueada' ? 'text-block font-medium' : 'text-greyt'))
</script>
