<template>
  <div class="rounded-xl border bg-white p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
    :class="isRisk ? 'border-block/40 bg-block/5' : 'border-vac/60'">
    <div class="flex items-center gap-3">
      <span v-if="icon" class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" :class="isRisk ? 'bg-block/15 text-block' : CHIP[tone]">
        <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="icon" /></svg>
      </span>
      <div class="min-w-0">
        <p class="text-xs uppercase tracking-wide text-greyt">{{ label }}</p>
        <p class="text-2xl sm:text-3xl font-bold leading-tight" :class="isRisk ? 'text-block' : TONE[tone]">
          {{ display }}<span v-if="suffix" class="text-xl">{{ suffix }}</span>
        </p>
      </div>
    </div>
    <p v-if="hint" class="text-[11px] text-greyt mt-2 truncate">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
type Tone = 'navy' | 'steel' | 'steel2' | 'block'
const props = withDefaults(defineProps<{
  label: string; value: number; suffix?: string; tone?: Tone; risk?: boolean; hint?: string; animate?: boolean; icon?: string
}>(), { suffix: '', tone: 'navy', risk: false, animate: true })

const TONE: Record<Tone, string> = { navy: 'text-navy', steel: 'text-steel', steel2: 'text-steel2', block: 'text-block' }
const CHIP: Record<Tone, string> = { navy: 'bg-navy/10 text-navy', steel: 'bg-steel/10 text-steel', steel2: 'bg-steel2/15 text-steel2', block: 'bg-block/10 text-block' }
const isRisk = computed(() => props.risk && props.value > 0)
const display = useCountUp(() => props.value, { enabled: () => props.animate })
</script>
