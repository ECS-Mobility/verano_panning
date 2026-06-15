<template>
  <div class="rounded-xl border border-vac/60 bg-white p-4 flex flex-wrap items-center justify-between gap-3">
    <div class="min-w-0">
      <p class="text-sm font-semibold text-navy">{{ title }}</p>
      <p v-if="desc" class="text-[12px] text-greyt mt-0.5">{{ desc }}</p>
    </div>
    <div class="shrink-0"><slot /></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; desc?: string }>()
</script>
