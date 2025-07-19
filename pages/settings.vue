<script setup lang="ts">
  const itemRepo = useItemRepo()
  const customerRepo = useCustomerRepo()



</script>

<template>
  <UContainer class="py-10">
    <h1 class="text-2xl font-bold mb-4">Settings</h1>
    <div>
      <UButton @click="itemRepo.addDemoItems()">Add Demo Items</UButton>
    </div>
    <div>
      <UButton @click="customerRepo.addDemoCustomers()">Add Demo Customers</UButton>
    </div>

    <p class="text-gray-500 dark:text-gray-400">Rest is Coming soon…</p>
  </UContainer>
</template>
