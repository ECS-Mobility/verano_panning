import { toISODate } from '~/utils/plan'

// Carga el documento desde localStorage antes del primer render (SPA),
// y guarda automáticamente (debounced) ante cualquier cambio.
export default defineNuxtPlugin(() => {
  const plan = usePlan()
  const today = useToday()

  plan.load()

  let timer: ReturnType<typeof setTimeout> | undefined
  const debouncedSave = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => plan.save(), 400)
  }
  watch(plan.doc, () => { if (plan.ready.value) debouncedSave() }, { deep: true })

  const refreshToday = () => { today.value = toISODate(new Date()) }
  window.addEventListener('focus', refreshToday)
  window.addEventListener('beforeunload', () => {
    if (timer) clearTimeout(timer)
    plan.save()
  })
})
