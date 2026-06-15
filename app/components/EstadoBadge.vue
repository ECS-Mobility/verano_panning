<template>
  <span class="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full" :class="ESTADO_PILL[estado]">
    <span class="w-1.5 h-1.5 rounded-full" :class="ESTADO_DOT[estado]" />{{ estado }}
  </span>
</template>

<script setup lang="ts">
import type { Estado } from '~/types'
import { ESTADO_DOT, ESTADO_PILL } from '~/utils/plan'

defineProps<{ estado: Estado }>()
</script>
