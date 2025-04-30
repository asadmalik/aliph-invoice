<template>
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <UCard v-for="card in cards" :key="card.to" :ui="{ body: { base: 'flex flex-col gap-4' } }"
      class="hover:shadow-lg transition">
      <template #header>
        <UIcon :name="card.icon" class="h-8 w-8 text-primary" />
      </template>

      <h3 class="text-lg font-semibold">{{ card.title }}</h3>
      <p class="text-gray-500 dark:text-gray-400">{{ card.description }}</p>

      <template #footer>
        <UButton :to="card.to" color="primary">{{ card.cta }}</UButton>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">

  definePageMeta({
    layout: 'default'
  })


  const cards = [
    { title: 'Create an Invoice', description: 'Generate a new invoice for a customer.', icon: 'i-heroicons-plus-circle', cta: 'Create Invoice', to: '/invoice/new' },
    { title: 'Invoices', description: 'Browse, filter and manage all invoices.', icon: 'i-heroicons-document-text', cta: 'View Invoices', to: '/invoice' },
    { title: 'Add a Customer', description: 'Add a new customer record.', icon: 'i-heroicons-user-plus', cta: 'Create Customer', to: '/customers/new' },
    { title: 'Customers', description: 'Manage your customer list.', icon: 'i-heroicons-users', cta: 'View Customers', to: '/customers' },
    {
      title: 'Inventory Items', description: 'Manage your services and stock.', icon: 'i-heroicons-numbered-list-solid',
      cta: 'View Inventory', to: '/items'
    },
    { title: 'Settings', description: 'Customize tax rates, company info and more.', icon: 'i-heroicons-cog-6-tooth', cta: 'Open Settings', to: '/settings' }
  ]
</script>
