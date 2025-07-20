<!-- layouts/default.vue -->
<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">


    <!-- page content -->
    <main class="flex-1 flex flex-col gap-8 mx-auto w-full max-w-7xl px-4 py-6">
      <!-- full‑width sticky toolbar -->
      <AppToolbar />
      <UApp>
        <div v-if="route.path !== '/'" class="text-gray-600 dark:text-gray-400 text-center text-xs italic">
          <NuxtLink to="/" class="font-semibold text-primary">Home</NuxtLink>
          <template v-for="(crumb, index) in breadcrumbs" :key="crumb.to">
            <span class="text-gray-500 dark:text-gray-400"> / </span>
            <span v-if="crumb.isLast" class="font-semibold">{{ crumb.name }}</span>
            <NuxtLink v-else key="index" :to="crumb.to" class="font-semibold text-primary">
              {{ crumb.name }}
            </NuxtLink>
          </template>
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

  const breadcrumbs = computed(() => {
    const segments = route.path.split('/').filter(Boolean)
    const parts = []

    for (let i = 0; i < segments.length; i++) {
      const to = '/' + segments.slice(0, i + 1).join('/')
      const isLast = i === segments.length - 1
      const name = segments[i]

      parts.push({
        to,
        name: decodeURIComponent(name),
        isLast
      })
    }

    return parts
  })
</script>

