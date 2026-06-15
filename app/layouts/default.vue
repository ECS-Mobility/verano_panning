<template>
  <div class="min-h-screen flex flex-col">
    <div class="sticky top-0 z-30">
      <AppHeader />
      <AppTabNav />
    </div>
    <main class="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
