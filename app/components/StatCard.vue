<template>
  <div class="rounded-xl border p-4 bg-white transition-shadow hover:shadow-sm"
    :class="risk && value > 0 ? 'border-block/40 bg-block/5' : 'border-vac/60'">
    <p class="text-xs uppercase tracking-wide text-greyt">{{ label }}</p>
    <p class="text-3xl font-bold mt-1" :class="risk && value > 0 ? 'text-block' : toneClass">
      {{ display }}<span v-if="suffix" class="text-xl">{{ suffix }}</span>
    </p>
    <p v-if="hint" class="text-[11px] text-greyt mt-1 truncate">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
type Tone = 'navy' | 'steel' | 'steel2' | 'block'
const props = withDefaults(defineProps<{
  label: string; value: number; suffix?: string; tone?: Tone; risk?: boolean; hint?: string; animate?: boolean
}>(), { suffix: '', tone: 'navy', risk: false, animate: true })

const TONE: Record<Tone, string> = { navy: 'text-navy', steel: 'text-steel', steel2: 'text-steel2', block: 'text-block' }
const toneClass = computed(() => TONE[props.tone])
const display = useCountUp(() => props.value, { enabled: () => props.animate })
</script>
