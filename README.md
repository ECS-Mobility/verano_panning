# Plan de Tareas · Verano 2026

App interna de seguimiento de tareas (Transformación Digital · ECS Mobility) para el verano 2026.
Multivista, animada y con persistencia local — pensada como herramienta efímera de ~2 meses.

## Vistas
- **Dashboard** — progreso global, fecha de hoy en vivo, sprint actual, próximos hitos y avance por prioridad.
- **Tareas** — crear / editar / borrar tareas por nivel (L1/L2/L3 + continuos L0), cada una con sus objetivos (subtareas).
- **Sprints** — 12 sprints semanales fijos (lun–vie, 15/06 → 01/09). Asigna objetivos a cada semana y sigue el cumplimiento.
- **Gantt / Calendario** — vista temporal semanal interactiva.
- **Ajustes** — exportar/importar JSON, reiniciar, configuración (inicio del verano, vacaciones, responsable, animaciones).

## Stack
- Nuxt 4 (modo SPA, `ssr: false`) + Vue 3 + TypeScript
- Tailwind CSS v4 · cero dependencias runtime
- Persistencia: `localStorage` (aislada en `app/utils/persistence.ts`)

## Desarrollo
```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # comprobación de tipos
npm run build      # build de producción (preset Vercel)
```
Requiere Node ≥ 20.19 (ver `.nvmrc`).

## Despliegue en Vercel
1. Push del repo a GitHub.
2. Import en Vercel → framework **Nuxt** (autodetectado). El preset Nitro está fijado a `vercel` en `nuxt.config.ts`.
3. Deploy.

> ⚠️ **Importante (privacidad):** la app no tiene autenticación y muestra nombres de personas y
> planes internos. Antes de exponerla, activa **Vercel → Settings → Deployment Protection**
> (Password o SSO) para que solo el equipo pueda acceder. Ya incluye `noindex` + `robots.txt`
> para evitar indexación en buscadores.

## Datos y persistencia
El plan inicial vive en `app/data/seed.ts`. En la primera carga se vuelca a `localStorage`
(clave `plan-verano-2026`) y a partir de ahí es **totalmente editable**: el % y el estado de cada
tarea se calculan a partir de sus objetivos. Toda la persistencia está aislada en
`app/utils/persistence.ts` (cargar/guardar/migrar/exportar/importar).

Como los datos viven solo en el navegador, usa **Ajustes → Exportar** para copia de seguridad o
para pasar el plan a otro equipo (**Importar**).
