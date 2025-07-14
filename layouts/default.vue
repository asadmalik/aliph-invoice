<!-- layouts/default.vue  (or dashboard.vue) -->
<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">


    <!-- page content -->
    <main class="flex-1 flex flex-col gap-8 mx-auto w-full max-w-7xl px-4 py-6">
      <!-- full‑width sticky toolbar -->
      <AppToolbar />
      <UApp>
        <NuxtPage />
      </UApp>
    </main>
  </div>
</template>

