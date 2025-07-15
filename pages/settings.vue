<script setup lang="ts">
import { seedDatabase } from '~/services/seedDatabase';

</script>

<template>
  <UContainer class="py-10">
    <h1 class="text-2xl font-bold mb-4">Settings</h1>
    <div>
      <UButton @click="seedDatabase">Seed Database</UButton>
    </div>
    <p class="text-gray-500 dark:text-gray-400">Rest is Coming soon…</p>
  </UContainer>
</template>
