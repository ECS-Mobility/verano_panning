<template>
  <aside class="hidden lg:flex sticky top-0 h-screen shrink-0 w-60 border-r border-vac/60 bg-white flex-col z-30">
    <!-- Logo / título -->
    <div class="px-5 py-4 border-b border-vac/50">
      <img src="/ecs-logo.png" alt="ECS Mobility" class="h-7 w-auto" />
      <p class="text-xs font-semibold text-navy mt-2.5">Plan de Tareas · Verano 2026</p>
    </div>

    <!-- Navegación -->
    <nav class="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
      <NuxtLink v-for="(tab, idx) in NAV_TABS" :key="tab.to" :to="tab.to"
        class="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
        :class="idx === act ? 'bg-navy/10 text-navy font-semibold' : 'text-greyt hover:bg-rowa hover:text-navy'">
        <span v-if="idx === act" class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-navy" />
        <svg viewBox="0 0 24 24" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="tab.icon" /></svg>
        {{ tab.label }}
      </NuxtLink>
    </nav>

    <!-- Fecha / sprint -->
    <div class="border-t border-vac/50 px-4 py-3">
      <LiveDate />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { NAV_TABS, useActiveTab } from '~/composables/useNavTabs'
const act = useActiveTab()
</script>
