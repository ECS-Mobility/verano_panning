import type { Task } from '~/types'

// Plan real de verano 2026 (generado desde el Excel). Sirve como contenido
// inicial editable: en la primera carga se vuelca a localStorage y a partir
// de ahí el usuario lo edita libremente. IDs de subtarea (s1..s26) y de tarea
// ('t:CODE') se preservan para poder migrar progreso guardado previamente.

export const SEED_TASKS: Task[] = [
  // --- Continuos · L0 ---
  { id: 't:ORT', code: 'ORT', name: 'Proyecto Ortems', resp: 'Erik', level: 'L0', type: 'cont', start: '2026-06-15', end: '2026-09-01', subtasks: [], estado: 'Continuo', pct: null },
  { id: 't:CAP', code: 'CAP', name: 'Proyecto Captura de datos planta', resp: 'Erik', level: 'L0', type: 'cont', start: '2026-06-15', end: '2026-09-01', subtasks: [], estado: 'Continuo', pct: null },

  // --- L1 · Prioridad alta ---
  {
    id: 't:CV', code: 'CV', name: 'Control volante', resp: 'Erik', level: 'L1', type: 'task',
    start: '2026-06-15', end: '2026-07-08', estado: 'Pendiente', pct: 0,
    subtasks: [
      { id: 's1', name: 'Digitalizar 11 formularios restantes', resp: 'Erik', start: '2026-06-15', end: '2026-07-03', estado: 'Pendiente', pct: 0, sprintId: null },
      { id: 's2', name: 'Montar Power BI', resp: 'Erik', start: '2026-06-29', end: '2026-07-06', estado: 'Pendiente', pct: 0, sprintId: null },
      { id: 's3', name: 'Depurar Power BI', resp: 'Erik', start: '2026-07-06', end: '2026-07-08', estado: 'Pendiente', pct: 0, sprintId: null },
      { id: 's4', name: 'Reunión con Jorge Prol (presentación)', resp: 'Erik · J. Prol', start: '2026-07-08', end: '2026-07-08', estado: 'Pendiente', pct: 0, sprintId: null, milestone: true }
    ]
  },

  // --- Gobierno del dato y digitalización · 3 iniciativas en paralelo (L1) ---
  {
    id: 't:PAC', code: 'PAC', name: 'PAC (ingeniería)', resp: 'Erik', level: 'L1', type: 'task',
    groupLabel: 'Gobierno del dato y digitalización · 3 iniciativas en paralelo',
    start: '2026-06-15', end: '2026-09-01', estado: 'Pendiente', pct: 0,
    subtasks: [
      { id: 's5', name: 'Fase 1 · Análisis', resp: 'Erik', start: '2026-06-15', end: '2026-06-26', estado: 'Pendiente', pct: 0, sprintId: null },
      { id: 's6', name: 'Fase 2 · Planificación y propuesta', resp: 'Erik', start: '2026-06-29', end: '2026-07-03', estado: 'Pendiente', pct: 0, sprintId: null, milestone: true },
      { id: 's6c', name: 'Fase 3 · Desarrollo', resp: 'Erik', start: '2026-07-06', end: '2026-09-01', estado: 'Pendiente', pct: 0, sprintId: null }
    ]
  },
  {
    id: 't:SIG', code: 'SIG', name: 'Sigdot (ingeniería)', resp: 'Erik', level: 'L1', type: 'task',
    groupLabel: 'Gobierno del dato y digitalización · 3 iniciativas en paralelo',
    start: '2026-06-15', end: '2026-09-01', estado: 'Pendiente', pct: 0,
    subtasks: [
      { id: 's7', name: 'Fase 1 · Análisis', resp: 'Erik', start: '2026-06-15', end: '2026-06-26', estado: 'Pendiente', pct: 0, sprintId: null },
      { id: 's8', name: 'Fase 2 · Planificación y propuesta', resp: 'Erik', start: '2026-06-29', end: '2026-07-03', estado: 'Pendiente', pct: 0, sprintId: null, milestone: true },
      { id: 's8c', name: 'Fase 3 · Desarrollo', resp: 'Erik', start: '2026-07-06', end: '2026-09-01', estado: 'Pendiente', pct: 0, sprintId: null }
    ]
  },
  {
    id: 't:MES', code: 'MES', name: 'MES Izaro', resp: 'Erik', level: 'L1', type: 'task',
    groupLabel: 'Gobierno del dato y digitalización · 3 iniciativas en paralelo',
    start: '2026-06-15', end: '2026-09-01', estado: 'Pendiente', pct: 0,
    subtasks: [
      { id: 's9', name: 'Fase 1 · Análisis', resp: 'Erik', start: '2026-06-15', end: '2026-06-26', estado: 'Pendiente', pct: 0, sprintId: null },
      { id: 's10', name: 'Fase 2 · Planificación y propuesta', resp: 'Erik', start: '2026-06-29', end: '2026-07-03', estado: 'Pendiente', pct: 0, sprintId: null, milestone: true },
      { id: 's10c', name: 'Fase 3 · Desarrollo', resp: 'Erik', start: '2026-07-06', end: '2026-09-01', estado: 'Pendiente', pct: 0, sprintId: null }
    ]
  },

  // --- L2 · Prioridad media ---
  {
    id: 't:CLA', code: 'CLA', name: 'Análisis necesidades licencias Claude', resp: 'Erik', level: 'L2', type: 'task',
    start: '2026-06-15', end: '2026-06-29', estado: 'Pendiente', pct: 0,
    subtasks: [
      { id: 's11', name: 'Decidir quién necesita licencia', resp: 'Erik', start: '2026-06-15', end: '2026-06-22', estado: 'Pendiente', pct: 0, sprintId: null },
      { id: 's12', name: 'Solicitar y comprar licencias', resp: 'Erik', start: '2026-06-22', end: '2026-06-22', estado: 'Pendiente', pct: 0, sprintId: null, milestone: true },
      { id: 's12b', name: 'Onboarding de usuarios', resp: 'Erik', start: '2026-06-22', end: '2026-06-29', estado: 'Pendiente', pct: 0, sprintId: null }
    ]
  },
  {
    id: 't:INV', code: 'INV', name: 'Digitalización inventario físico (Snipe-IT)', resp: 'Erik · Dani', level: 'L2', type: 'task',
    start: '2026-06-22', end: '2026-08-28', estado: 'Pendiente', pct: 0,
    subtasks: [
      { id: 's13', name: 'Alta de dispositivos faltantes (PC / móvil)', resp: 'Erik · Dani', start: '2026-06-22', end: '2026-07-31', estado: 'Pendiente', pct: 0, sprintId: null },
      { id: 's14', name: 'Vincular dispositivo ↔ usuario ↔ licencias', resp: 'Erik · Dani', start: '2026-07-27', end: '2026-08-28', estado: 'Pendiente', pct: 0, sprintId: null },
      { id: 's15', name: 'Validar vista por usuario (PC+móvil+licencias)', resp: 'Erik', start: '2026-08-24', end: '2026-08-28', estado: 'Pendiente', pct: 0, sprintId: null, milestone: true }
    ]
  },
  {
    id: 't:IOS', code: 'IOS', name: 'Análisis y propuesta teléfonos iOS', resp: 'Erik', level: 'L2', type: 'task',
    start: '2026-07-27', end: '2026-08-28', estado: 'Pendiente', pct: 0,
    subtasks: [
      { id: 's16', name: 'Análisis de necesidades y perfiles (dirección + clave)', resp: 'Erik', start: '2026-07-27', end: '2026-08-07', estado: 'Pendiente', pct: 0, sprintId: null },
      { id: 's17', name: 'Propuesta de modelos y plan de renovación', resp: 'Erik', start: '2026-08-17', end: '2026-08-28', estado: 'Pendiente', pct: 0, sprintId: null }
    ]
  },
  {
    id: 't:FAC', code: 'FAC', name: 'Activación de clases de factura (filtrado de visibilidad)', resp: 'Erik', level: 'L2', type: 'task',
    start: '2026-06-22', end: '2026-07-17', estado: 'Pendiente', pct: 0,
    subtasks: [
      { id: 's18', name: 'Activar clases de factura en el sistema', resp: 'Erik', start: '2026-06-22', end: '2026-07-03', estado: 'Pendiente', pct: 0, sprintId: null },
      { id: 's19', name: 'Configurar y validar filtrado por usuario (quién ve qué)', resp: 'Erik', start: '2026-07-06', end: '2026-07-17', estado: 'Pendiente', pct: 0, sprintId: null }
    ]
  },
  {
    id: 't:FOR', code: 'FOR', name: 'Formación IZARO · Producción (Ainhoa)', resp: 'Erik', level: 'L2', type: 'task',
    start: '2026-06-16', end: '2026-08-20', estado: 'En curso', pct: 0, subtasks: []
  },

  // --- L3 · Prioridad baja ---
  { id: 't:SOP', code: 'SOP', name: 'Mejora continua y soporte a ECS', resp: 'Erik · Dani', level: 'L3', type: 'cont', start: '2026-06-15', end: '2026-09-01', subtasks: [], estado: 'Continuo', pct: null },
  {
    id: 't:ROT', code: 'ROT', name: 'Mantenimiento y rotación de dispositivos', resp: 'Erik · Dani', level: 'L3', type: 'task',
    start: '2026-06-15', end: '2026-09-01', estado: 'Pendiente', pct: 0,
    subtasks: [
      { id: 's20', name: 'Rotación de equipo a usuario', resp: 'Erik', start: '2026-07-01', end: '2026-07-31', estado: 'Pendiente', pct: 0, sprintId: null }
    ]
  },
  {
    id: 't:SRV', code: 'SRV', name: 'Propuesta servidores (cloud + on-premise)', resp: 'Erik', level: 'L3', type: 'task',
    start: '2026-08-17', end: '2026-09-01', estado: 'Pendiente', pct: 0,
    subtasks: [
      { id: 's21', name: 'Propuesta cloud (despliegues digitalización) + precios', resp: 'Erik', start: '2026-08-17', end: '2026-08-24', estado: 'Pendiente', pct: 0, sprintId: null },
      { id: 's22', name: "Propuesta on-premise / 'hierro' + precios", resp: 'Erik', start: '2026-08-17', end: '2026-08-24', estado: 'Pendiente', pct: 0, sprintId: null },
      { id: 's23', name: 'Comparativa y recomendación', resp: 'Erik', start: '2026-08-25', end: '2026-09-01', estado: 'Pendiente', pct: 0, sprintId: null, milestone: true }
    ]
  },
  {
    id: 't:SOB', code: 'SOB', name: 'Investigar impresión completa en sobres (ahorro)', resp: 'Erik', level: 'L3', type: 'task',
    start: '2026-08-17', end: '2026-09-01', estado: 'Pendiente', pct: 0,
    subtasks: [
      { id: 's24', name: 'Analizar plantilla y coste actual (sobres preimpresos)', resp: 'Erik', start: '2026-08-17', end: '2026-08-21', estado: 'Pendiente', pct: 0, sprintId: null },
      { id: 's25', name: 'Probar impresión completa (plantilla + datos) en sobre en blanco', resp: 'Erik', start: '2026-08-24', end: '2026-08-28', estado: 'Pendiente', pct: 0, sprintId: null },
      { id: 's26', name: 'Comparar coste vs preimpresos y recomendación', resp: 'Erik', start: '2026-08-28', end: '2026-09-01', estado: 'Pendiente', pct: 0, sprintId: null, milestone: true }
    ]
  }
]
