<!-- layouts/default.vue  (or dashboard.vue) -->
<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">


    <!-- page content -->
    <main class="flex-1 flex flex-col gap-8 mx-auto w-full max-w-7xl px-4 py-6">
      <!-- full‑width sticky toolbar -->
      <AppToolbar />
      <UApp>
        <div v-if="route.path !== '/'" class=" text-gray-600 dark:text-gray-400 text-center text-xs italic">
          <NuxtLink to="/" class=" font-semibold text-primary">Home</NuxtLink>
          <span class="text-gray-500 dark:text-gray-400"> / </span>
          <span class=" font-semibold">{{ route.meta.title || 'Untitled Page' }}</span>
        </div>
        <div class="mt-6">
          <NuxtPage />
        </div>

      </UApp>
    </main>
  </div>
</template>

<script setup lang="ts">
  const route = useRoute()
</script>

