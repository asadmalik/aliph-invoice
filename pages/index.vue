<template>
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

    <UCard
      :ui="{root:'hover:shadow-lg transition flex flex-col gap-4 space-between justify-between', header:'flex items-center gap-2', footer:'flex flex-row justify-between'}">
      <template #header>
        <UIcon name="i-heroicons-numbered-list-solid" class="h-8 w-8 text-primary" />
        <h1 class="text-lg font-semibold">Items</h1>
      </template>

      <div class="h-full flex flex-col gap-2.5 justify-between flex-auto grow">
        <div> Search</div>
        <USelectMenu :items="items" class="w-full" size="lg" />
      </div>

      <template #footer>
        <UButton to="/items/" color="primary" icon="i-heroicons-numbered-list-solid">Manage Items</UButton>
        <UButton to="/items/new" color="primary" icon="i-heroicons-plus">
          Add New Item
        </UButton>
      </template>
    </UCard>


    <UCard
v-for="card in cards" :key="card.to" :ui="{ body: { base: 'flex flex-col gap-4' } }"
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

  const search = ref('');

  const base = (type: string) => `/voucher/${type}`

  const items = ref(await useItemRepo().getAll().then(items => items.map(item => ({
    label: item.name,
    id: item.id
  }))));

  const cards = [
    // Sale Invoices
    {
      title: 'Create Sale Invoice',
      description: 'Generate a new sales invoice for a customer.',
      icon: 'i-heroicons-plus-circle',
      cta: 'New Sale',
      to: `${base('sale')}/new`
    },
    {
      title: 'Sale Invoices',
      description: 'Browse and manage all sales invoices.',
      icon: 'i-heroicons-document-text',
      cta: 'View Sales',
      to: `${base('sale')}`
    },

    // Purchase Invoices
    {
      title: 'Create Purchase Invoice',
      description: 'Generate a new purchase invoice.',
      icon: 'i-heroicons-plus-circle',
      cta: 'New Purchase',
      to: `${base('purchase')}/new`
    },
    {
      title: 'Purchase Invoices',
      description: 'Browse and manage all purchase invoices.',
      icon: 'i-heroicons-document-text',
      cta: 'View Purchases',
      to: `${base('purchase')}`
    },

    // Credit Notes
    {
      title: 'Create Credit Note',
      description: 'Issue a credit note for a previous invoice.',
      icon: 'i-heroicons-plus-circle',
      cta: 'New Credit',
      to: `${base('credit')}/new`
    },
    {
      title: 'Credit Notes',
      description: 'Browse and manage all credit notes.',
      icon: 'i-heroicons-document-text',
      cta: 'View Credits',
      to: `${base('credit')}`
    },

    // Existing cards
    {
      title: 'Add a Customer',
      description: 'Add a new customer record.',
      icon: 'i-heroicons-user-plus',
      cta: 'New Customer',
      to: '/customers/new'
    },
    {
      title: 'Customers',
      description: 'Manage your customer list.',
      icon: 'i-heroicons-users',
      cta: 'View Customers',
      to: '/customers'
    },
    {
      title: 'Inventory Items',
      description: 'Manage your services and stock.',
      icon: 'i-heroicons-numbered-list-solid',
      cta: 'View Inventory',
      to: '/items'
    },
    {
      title: 'Settings',
      description: 'Customize tax rates, company info and more.',
      icon: 'i-heroicons-cog-6-tooth',
      cta: 'Open Settings',
      to: '/settings'
    }
  ]
</script>
