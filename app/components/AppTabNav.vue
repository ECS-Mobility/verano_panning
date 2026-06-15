<template>
  <nav class="border-b border-vac/60 bg-white">
    <div class="max-w-[1400px] mx-auto px-4 sm:px-6">
      <div ref="wrap" class="relative flex gap-0.5 overflow-x-auto">
        <NuxtLink
          v-for="(tab, i) in tabs" :key="tab.to" :to="tab.to"
          class="tab-link px-3 sm:px-4 py-3 text-sm whitespace-nowrap transition-colors outline-none focus-visible:bg-rowa rounded-t-md"
          :class="i === act ? 'text-navy font-semibold' : 'text-greyt hover:text-steel'">
          <span class="inline-flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="tab.icon" /></svg>
            {{ tab.label }}
          </span>
        </NuxtLink>
        <span class="absolute bottom-0 h-[2.5px] bg-navy rounded-full transition-all duration-300 ease-out"
          :style="{ left: indicator.left + 'px', width: indicator.width + 'px' }" />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const wrap = ref<HTMLElement | null>(null)
const indicator = reactive({ left: 0, width: 0 })

const tabs = [
  { to: '/', label: 'Dashboard', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
  { to: '/tareas', label: 'Tareas', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  { to: '/sprints', label: 'Sprints', icon: 'M3 4h18v4H3zM3 10h5v10H3zM10 10h5v10h-5zM17 10h4v10h-4z' },
  { to: '/gantt', label: 'Gantt', icon: 'M4 5h10M4 10h14M4 15h7M4 20h11' },
  { to: '/ajustes', label: 'Ajustes', icon: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6' }
]

const act = computed(() => {
  let idx = 0, best = -1
  tabs.forEach((t, i) => {
    const m = t.to === '/' ? route.path === '/' : route.path.startsWith(t.to)
    if (m && t.to.length > best) { best = t.to.length; idx = i }
  })
  return idx
})

function update() {
  const el = wrap.value?.querySelectorAll<HTMLElement>('.tab-link')[act.value]
  if (el) { indicator.left = el.offsetLeft; indicator.width = el.offsetWidth }
}

onMounted(() => { update(); window.addEventListener('resize', update) })
onUnmounted(() => window.removeEventListener('resize', update))
watch(() => route.path, () => nextTick(update))
</script>
