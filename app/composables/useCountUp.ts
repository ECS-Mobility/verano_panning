// Anima un número de 0 (o valor previo) al objetivo. Respeta prefers-reduced-motion
// y un flag `enabled` opcional (p.ej. el ajuste de animaciones).
export function useCountUp(target: () => number, opts: { ms?: number; enabled?: () => boolean } = {}) {
  const ms = opts.ms ?? 600
  const val = ref(0)
  let raf = 0
  const reduced = () =>
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

  function run() {
    const to = target()
    const enabled = opts.enabled ? opts.enabled() : true
    cancelAnimationFrame(raf)
    if (!enabled || reduced()) { val.value = to; return }
    const from = val.value
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms)
      val.value = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  }

  onMounted(run)
  watch(target, run)
  onUnmounted(() => cancelAnimationFrame(raf))
  return val
}
