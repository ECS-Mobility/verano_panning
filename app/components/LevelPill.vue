<template>
  <span class="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded" :class="style">
    {{ level }}<span v-if="showLabel" class="font-medium opacity-80">· {{ LEVEL_LABEL[level] }}</span>
  </span>
</template>

<script setup lang="ts">
import type { Level } from '~/types'
import { LEVEL_LABEL } from '~/utils/plan'

const props = defineProps<{ level: Level; showLabel?: boolean }>()
const STYLE: Record<Level, string> = {
  L0: 'bg-steel/15 text-steel',
  L1: 'bg-navy/15 text-navy',
  L2: 'bg-steel2/15 text-steel2',
  L3: 'bg-l3/30 text-greyt'
}
const style = computed(() => STYLE[props.level])
</script>
