<template>
  <div class="relative inline-flex items-center justify-center shrink-0" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" class="-rotate-90">
      <circle :cx="c" :cy="c" :r="r" fill="none" :stroke-width="stroke" class="stroke-vac/40" />
      <circle :cx="c" :cy="c" :r="r" fill="none" :stroke-width="stroke" stroke-linecap="round"
        :stroke="color" :stroke-dasharray="circ" :stroke-dashoffset="offset" class="ring-value" />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center leading-none">
      <span class="font-bold text-navy" :style="{ fontSize: size * 0.27 + 'px' }">
        {{ display }}<span class="text-[0.55em] font-semibold">%</span>
      </span>
      <span v-if="label" class="text-greyt mt-0.5" :style="{ fontSize: Math.max(9, size * 0.12) + 'px' }">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  value: number; size?: number; stroke?: number; color?: string; label?: string; animate?: boolean
}>(), { size: 84, stroke: 8, color: '#283b4c', animate: true })

const c = computed(() => props.size / 2)
const r = computed(() => props.size / 2 - props.stroke / 2)
const circ = computed(() => 2 * Math.PI * r.value)
const clamped = computed(() => Math.max(0, Math.min(100, props.value)))
const offset = computed(() => circ.value * (1 - clamped.value / 100))
const display = useCountUp(() => clamped.value, { enabled: () => props.animate })
</script>
