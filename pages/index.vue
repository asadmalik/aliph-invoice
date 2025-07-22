<template>
  <div>
<UModal v-model:open="showDialog">
  <template #body>
    <p v-if="confirmType === 'both'" class="py-4 text-center">
      No items or customers found.<br>
      Would you like to add demo items, demo customers, or both?
    </p>
    <p v-else-if="confirmType === 'items'" class="py-4 text-center">
      No items found.<br>
      Would you like to add demo items now?
    </p>
    <p v-else class="py-4 text-center">
      No customers found.<br>
      Would you like to add demo customers now?
    </p>
  </template>

  <template #footer>
    <!-- BOTH CASE: three action buttons -->
    <div v-if="confirmType === 'both'" class="flex flex-wrap gap-3 justify-center">
      <UButton color="primary" @click="runDemo('items')">Add Demo Items</UButton>
      <UButton color="primary" @click="runDemo('customers')">Add Demo Customers</UButton>
      <UButton color="primary" @click="runDemo('both')">Add Both</UButton>
      <UButton variant="outline" @click="showDialog = false">Cancel</UButton>
    </div>

    <!-- SINGLE CASE: yes / cancel -->
    <div v-else class="flex gap-3 justify-center">
      <UButton color="primary" @click="runDemo(confirmType)">
        Yes, add demo {{ confirmType }}
      </UButton>
      <UButton variant="outline" @click="showDialog = false">Cancel</UButton>
    </div>
  </template>
</UModal>

    <!-- 2) Top Cards: Items & Customers -->
    <div class="grid gap-6 grid-cols-1 md:grid-cols-2 p-10 md:gap-10">
      <!-- Items Card -->
      <UCard
:ui="{
        root: 'hover:shadow-lg transition flex flex-col gap-4 justify-between shadow-lg hover:shadow-xl',
        header: 'flex items-center gap-2',
        footer: 'flex flex-row justify-between'
      }">
        <template #header>
          <UIcon name="i-heroicons-numbered-list-solid" class="h-8 w-8 text-primary" />
          <h1 class="text-lg font-semibold">Items ({{ items.length }})</h1>
        </template>
        <div class="h-full flex flex-col gap-2.5 justify-between flex-auto grow">
          <div>Search</div>
          <USelectMenu
            v-model="selectedItem"
            :items="items"
            placeholder="Search or Select an item"
            class="w-full"
            size="lg"
            option-attribute="label"
            @update:model-value="itemSelected"
          />
          <div v-if="selectedItem" class="flex items-center gap-2">
            <UButton
              size="sm"
              color="info"
              :href="`/items/${selectedItem.id}`"
              icon="lucide:eye"
            >View</UButton>
            <UButton
              size="sm"
              color="warning"
              :href="`/items/${selectedItem.id}/edit`"
              icon="lucide:pencil-line"
            >Edit</UButton>
          </div>
        </div>
        <template #footer>
          <UButton to="/items" color="primary" icon="i-heroicons-numbered-list-solid">
            Manage Items
          </UButton>
          <UButton to="/items/new" color="primary" icon="i-heroicons-plus">
            Add New
          </UButton>
        </template>
      </UCard>

      <!-- Customers Card -->
      <UCard
:ui="{
        root: 'hover:shadow-lg transition flex flex-col gap-4 justify-between shadow-lg hover:shadow-xl',
        header: 'flex items-center gap-2',
        footer: 'flex flex-row justify-between'
      }">
        <template #header>
          <UIcon name="i-heroicons-users" class="h-8 w-8 text-primary" />
          <h1 class="text-lg font-semibold">Customers ({{ customers.length }})</h1>
        </template>
        <div class="h-full flex flex-col gap-2.5 justify-between flex-auto grow">
          <div>Search</div>
         <USelectMenu
            v-model="selectedCustomer"
            :items="customers"
            placeholder="Search or Select Customers"
            class="w-full"
            size="lg"
            option-attribute="label"
            @update:model-value="customerSelected"
          />
          <div v-if="selectedCustomer" class="flex items-center gap-2">
                        <UButton
              size="sm"
              color="info"
              :href="`/customers/${selectedCustomer.id}`"
              icon="lucide:eye"
            >View</UButton>
            <UButton
              size="sm"
              color="warning"
              :href="`/customers/${selectedCustomer.id}/edit`"
              icon="lucide:pencil-line"
            >Edit</UButton>
          </div>
        </div>
        <template #footer>
          <UButton to="/customers" color="primary" icon="i-heroicons-users">
            Manage Customers
          </UButton>
          <UButton to="/customers/new" color="primary" icon="i-heroicons-plus">
            Add Customer
          </UButton>
        </template>
      </UCard>

      <!-- Existing Sale Invoices Card -->
      <CardsSaleInvoices />
    </div>

    <!-- 3) Bottom Action Cards -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-9">
      <UCard v-for="card in cards" :key="card.to" :ui="{ root: 'flex flex-col gap-4' }" variant="subtle">
        <template #header>
          <UIcon :name="card.icon" class="h-8 w-8 text-primary" />
        </template>
        <h3 class="text-lg font-semibold">{{ card.title }}</h3>
        <p class="text-gray-500 dark:text-gray-400">{{ card.description }}</p>
        <template #footer>
          <UButton :to="card.to" color="primary" disabled>{{ card.cta }}</UButton>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">

  // Meta
  definePageMeta({ layout: 'default', title: 'Dashboard' })
  useSeoMeta({
    title: 'Dashboard',
    description: 'Manage your invoices, items, and customers efficiently.'
  })

  const itemRepo = useItemRepo()
const customerRepo = useCustomerRepo()
const toast = useToast()

// your existing reactive dropdown data…
const items = ref<{ label: string; id: number }[]>([])
const customers = ref<{ label: string; id: number }[]>([])
const selectedItem = ref<{ label: string; id: number } | null>(null)
const selectedCustomer = ref<{ label: string; id: number } | null>(null)
// which tables are empty? '' | 'items' | 'customers' | 'both'
const confirmType = ref<''|'items'|'customers'|'both'>('')

// proxy for UModal v-model
const showDialog = computed<boolean>({
  get: () => confirmType.value !== '',
  set: val => { if (!val) confirmType.value = '' }
})

// on mount, check both tables just once
onMounted(async () => {
  const rawItems = await itemRepo.getAll()
  items.value = rawItems.map(i => ({ label: i.name, id: i.id! }))

  const rawCust = await customerRepo.getAll()
  customers.value = rawCust.map(c => ({ label: c.name, id: c.id! }))

  const noItems = items.value.length === 0
  const noCust  = customers.value.length === 0

  if (noItems && noCust) {
    confirmType.value = 'both'
    showDialog.value = true
  }
  else if (noItems) {
    confirmType.value = 'items'
    showDialog.value = true
  }
  else if (noCust) {
    confirmType.value = 'customers'
    showDialog.value = true
  }
})

// seed whichever the user picks
async function runDemo(type: 'items'|'customers'|'both') {
  if (type === 'items' || type === 'both') {
    await itemRepo.addDemoItems()
    const updated = await itemRepo.getAll()
    items.value = updated.map(i => ({ label: i.name, id: i.id! }))
  }
  if (type === 'customers' || type === 'both') {
    await customerRepo.addDemoCustomers()
    const updated = await customerRepo.getAll()
    customers.value = updated.map(c => ({ label: c.name, id: c.id! }))
  }


 toast.add({
  // you can generate a unique id if you like, or omit it
  title:
    type === 'both'
      ? 'Demo Data Seeded'
      : type === 'items'
      ? 'Demo Items Seeded'
      : 'Demo Customers Seeded',
  description:
    type === 'both'
      ? 'Items and customers demo data added.'
      : type === 'items'
      ? 'Items demo data added.'
      : 'Customers demo data added.',
  // optional extras (check your Toast type):
  // timeout: 3000,
  // type: 'success',
  // position: 'top-right'
})

  // close modal
  confirmType.value = ''
}

  // Selection callbacks (unchanged)
  function itemSelected(item: { label: string; id: number }) {
    console.log('Selected item:', item)
  }
  function customerSelected(cust: { label: string; id: number }) {
    console.log('Selected customer:', cust)
  }
</script>
