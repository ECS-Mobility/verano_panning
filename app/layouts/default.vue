<template>
  <div class="min-h-screen flex">
    <AppSidebar />
    <div class="flex-1 min-w-0 flex flex-col">
      <AppTopbar />
      <main class="flex-1 w-full px-4 sm:px-6 py-5 pb-24 lg:pb-8">
        <slot />
      </main>
      <AppFooter class="hidden lg:block" />
    </div>
    <AppBottomNav />
  </div>
</template>
