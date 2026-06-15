import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-06-01',
  // SPA por ruta: localStorage es la fuente de verdad y así no hay mismatch/flash de hidratación.
  // (routeRules en vez de `ssr:false` global para no romper `nuxt dev` en Nuxt 4.4.x.)
  routeRules: { '/**': { ssr: false } },
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  nitro: { preset: 'vercel' },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'Plan de Tareas · Verano 2026',
      htmlAttrs: { lang: 'es' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'robots', content: 'noindex, nofollow' },
        { name: 'description', content: 'Seguimiento interno de tareas · Transformación Digital · ECS Mobility' },
        { name: 'theme-color', content: '#283b4c' }
      ],
      link: [{ rel: 'icon', href: '/ecs-logo.png' }]
    }
  }
})
