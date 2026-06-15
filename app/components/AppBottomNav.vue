<template>
  <nav class="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-vac/60 grid grid-cols-4 pb-[env(safe-area-inset-bottom)]">
    <NuxtLink v-for="(tab, idx) in NAV_TABS" :key="tab.to" :to="tab.to"
      class="relative flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition-colors"
      :class="idx === act ? 'text-navy font-semibold' : 'text-greyt'">
      <span v-if="idx === act" class="absolute top-0 inset-x-3 h-0.5 rounded-full bg-navy" />
      <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="tab.icon" /></svg>
      {{ tab.label }}
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { NAV_TABS, useActiveTab } from '~/composables/useNavTabs'
const act = useActiveTab()
</script>
