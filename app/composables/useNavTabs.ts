export interface NavTab { to: string; label: string; icon: string }

export const NAV_TABS: NavTab[] = [
  { to: '/', label: 'Dashboard', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
  { to: '/tareas', label: 'Tareas', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  { to: '/sprints', label: 'Sprints', icon: 'M3 4h18v4H3zM3 10h5v10H3zM10 10h5v10h-5zM17 10h4v10h-4z' },
  { to: '/ajustes', label: 'Ajustes', icon: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6' }
]

export function useActiveTab() {
  const route = useRoute()
  return computed(() => {
    let idx = 0, best = -1
    NAV_TABS.forEach((t, i) => {
      const m = t.to === '/' ? route.path === '/' : route.path.startsWith(t.to)
      if (m && t.to.length > best) { best = t.to.length; idx = i }
    })
    return idx
  })
}
