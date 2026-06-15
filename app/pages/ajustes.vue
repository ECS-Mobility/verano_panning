<template>
  <div class="space-y-6 max-w-3xl">
    <!-- Datos -->
    <section class="space-y-3">
      <h2 class="text-sm font-semibold text-greyt uppercase tracking-wide">Datos</h2>

      <SettingCard title="Exportar copia (JSON)" desc="Descarga todo el plan para guardarlo o pasarlo a otro equipo.">
        <button class="text-sm px-3 py-1.5 rounded-md bg-navy text-white hover:bg-dark transition-colors" @click="exportNow">Descargar</button>
      </SettingCard>

      <SettingCard title="Importar copia (JSON)" desc="Reemplaza el plan actual por el del fichero. Haz una copia antes.">
        <label class="text-sm px-3 py-1.5 rounded-md border border-vac/70 text-steel hover:text-navy hover:bg-rowa transition-colors cursor-pointer">
          Elegir fichero
          <input type="file" accept="application/json,.json" class="hidden" @change="onImport" />
        </label>
      </SettingCard>
      <p v-if="importMsg" class="text-xs px-1" :class="importOk ? 'text-steel' : 'text-block'">{{ importMsg }}</p>

      <SettingCard title="Reiniciar a datos de ejemplo" desc="Borra tus cambios y restaura el plan inicial de verano 2026.">
        <button class="text-sm px-3 py-1.5 rounded-md border border-block/40 text-block hover:bg-block/5 transition-colors" @click="confirmReset = true">Reiniciar</button>
      </SettingCard>
    </section>

    <!-- Configuración -->
    <section class="space-y-3">
      <h2 class="text-sm font-semibold text-greyt uppercase tracking-wide">Configuración</h2>

      <SettingCard title="Inicio del verano" desc="Lunes ancla. Regenera los 12 sprints semanales.">
        <input type="date" :value="settings.summerStart"
          class="text-sm rounded-md border border-vac/70 px-2.5 py-1.5 outline-none focus:border-steel"
          @change="updateSettings({ summerStart: ($event.target as HTMLInputElement).value })" />
      </SettingCard>

      <SettingCard title="Responsable por defecto" desc="Se prerellena al crear tareas y objetivos.">
        <input type="text" :value="settings.defaultResp"
          class="text-sm rounded-md border border-vac/70 px-2.5 py-1.5 outline-none focus:border-steel w-40"
          @change="updateSettings({ defaultResp: ($event.target as HTMLInputElement).value })" />
      </SettingCard>

      <SettingCard title="Animaciones" desc="Cuenta animada de números y transiciones.">
        <button role="switch" :aria-checked="settings.countUpAnimations"
          class="w-11 h-6 rounded-full transition-colors relative" :class="settings.countUpAnimations ? 'bg-steel2' : 'bg-vac'"
          @click="updateSettings({ countUpAnimations: !settings.countUpAnimations })">
          <span class="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all" :class="settings.countUpAnimations ? 'left-[22px]' : 'left-0.5'" />
        </button>
      </SettingCard>

      <div class="rounded-xl border border-vac/60 bg-white p-4">
        <p class="text-sm font-semibold text-navy">Semanas de vacaciones</p>
        <p class="text-[12px] text-greyt mt-0.5 mb-3">Se muestran atenuadas y no cuentan en el cumplimiento.</p>
        <div class="flex flex-wrap gap-1.5">
          <button v-for="sp in sprints" :key="sp.n" @click="toggleVac(sp.n)"
            class="text-xs px-2.5 py-1 rounded-full border transition-colors"
            :class="settings.vacationWeeks.includes(sp.n) ? 'border-vac bg-vac/50 text-greyt' : 'border-vac/60 text-greyt hover:border-steel'">
            S{{ sp.n }}
          </button>
        </div>
      </div>
    </section>

    <!-- Info -->
    <section class="space-y-3">
      <h2 class="text-sm font-semibold text-greyt uppercase tracking-wide">Información</h2>
      <div class="rounded-xl border border-vac/60 bg-white p-4 text-sm text-greyt space-y-1">
        <p>Tareas: <span class="text-navy font-medium">{{ tasks.length }}</span> · Objetivos: <span class="text-navy font-medium">{{ allSubtasks.length }}</span></p>
        <p>Última edición: <span class="text-navy font-medium">{{ savedLabel }}</span></p>
        <p class="text-[11px]">Los datos se guardan solo en este navegador (localStorage). Versión de datos v{{ doc.version }}.</p>
      </div>
    </section>

    <ConfirmDialog v-model="confirmReset" title="Reiniciar plan" danger confirm-text="Sí, reiniciar"
      message="Se borrarán todas tus tareas y progreso, y se restaurará el plan de ejemplo. ¿Continuar?" @confirm="resetToSeed" />
  </div>
</template>

<script setup lang="ts">
import { importJSON } from '~/utils/persistence'

const { settings, sprints, tasks, allSubtasks, doc, exportNow, resetToSeed, replaceDoc, updateSettings } = usePlan()

const confirmReset = ref(false)
const importMsg = ref('')
const importOk = ref(false)

function onImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const res = importJSON(String(reader.result))
    if (res.ok) { replaceDoc(res.doc); importOk.value = true; importMsg.value = 'Plan importado correctamente.' }
    else { importOk.value = false; importMsg.value = `No se pudo importar: ${res.error}` }
  }
  reader.readAsText(file)
  ;(e.target as HTMLInputElement).value = ''
}

function toggleVac(n: number) {
  const set = new Set(settings.value.vacationWeeks)
  set.has(n) ? set.delete(n) : set.add(n)
  updateSettings({ vacationWeeks: [...set].sort((a, b) => a - b) })
}

const savedLabel = computed(() => {
  if (!doc.value.savedAt) return '—'
  try { return new Date(doc.value.savedAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) }
  catch { return doc.value.savedAt }
})
</script>
