<script setup lang="ts">
  const itemRepo = useItemRepo()
  const customerRepo = useCustomerRepo()

definePageMeta({
  layout: 'default',
  title: 'Settings'
})
  useSeoMeta({
    title: 'Settings',
    description: 'Manage application settings, add demo data, and configure your account.'
  })

  const items = ref<IItem[]>([])
  const customers = ref<ICustomer[]>([])
  const itemCount = computed(() => items.value.length)
  const customerCount = computed(() => customers.value.length)

  // Fetch items and customers
  onMounted(async () => {
    items.value = await itemRepo.getAll()
    customers.value = await customerRepo.getAll()
  })

</script>

<template>
  <ClientOnly>
    <UContainer class="py-10">
      <h1 class="text-2xl font-bold mb-4">Settings</h1>
      <div class="flex flex-col gap-6 p-6">
        <h3 class="text-2xl">Demo Data</h3>
        <p><em>Buttons will be enabled only when there is no data in the database.</em></p>
        <div class="flex flex-row gap-5">
          <UButton
:disabled="itemCount>5" :color="itemCount > 0 ? 'primary' : 'neutral'"
            icon="i-heroicons-numbered-list-solid" @click="itemRepo.addDemoItems()">Add Demo Items</UButton>
          <UButton
:disabled="customerCount > 5" :color="customerCount > 0 ? 'primary' : 'neutral'"
            icon="i-heroicons-users" @click="customerRepo.addDemoCustomers()">Add Demo Customers</UButton>

          <UButton color="error" icon="heroicons:exclamation-triangle-20-solid" disabled>Flush Database</UButton>
        </div>
        <p class="text-gray-500 dark:text-gray-400">Demo data can be added only if there are no existing items or
          customers.</p>
      </div>

      <p class="text-gray-500 dark:text-gray-400">Rest is Coming soon…</p>
    </UContainer>
  </ClientOnly>
</template>
