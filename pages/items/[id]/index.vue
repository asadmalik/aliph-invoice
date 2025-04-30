<!-- eslint-disable vue/first-attribute-linebreak -->
<!--  pages\items\[id]\index.vue  -->
<template>
  <div class="max-w-screen-xl mx-auto p-4 sm:p-6 space-y-8">
    <!-- Back link -->
    <NuxtLink to="/items" class="text-primary-600 hover:underline flex items-center gap-1">
      <i class="i-lucide-arrow-left w-4 h-4" />
      Back to Items
    </NuxtLink>

    <!-- Item Details Card -->
    <UCard v-if="item" :ui="{ body: 'space-y-4' }">
      <template #header>
        <h2 class="text-xl font-semibold">{{ item.name }}</h2>
      </template>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <span class="font-medium">Unit Type:</span> {{ item.unitType }}
        </div>
        <div>
          <span class="font-medium">Rate:</span>
          {{ Number(item.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
        </div>
        <div class="sm:col-span-2">
          <span class="font-medium">Total Sold Value:</span>
          {{ totalSold.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
        </div>
      </div>
    </UCard>

    <!-- Invoices Table -->
    <div v-if="invoiceRows.length" class="overflow-x-auto">
      <h3 class="text-lg font-semibold mb-4">Appears in {{ invoiceRows.length }} Invoice<span
          v-if="invoiceRows.length > 1">s</span></h3>
      <UTable :data="invoiceRows" :columns="invoiceColumns"
        :ui="{ table: 'min-w-full', td: 'align-middle whitespace-nowrap' }" />
    </div>

    <UAlert v-else color="gray" variant="subtle">
      This item has not been used in any invoices yet.
    </UAlert>
  </div>
</template>

<script setup lang="ts">
  import { useRoute } from '#imports'
  import { invoiceRepo } from '@/DataLayer/repositories/InvoiceRepository'
  import { itemRepo } from '@/DataLayer/repositories/ItemRepository'
  import type { IInvoice, IItem } from '@/DataLayer/types'
  import { computed, ref } from 'vue'

  const route = useRoute()
  const id = Number(route.params.id)

  const item = ref<IItem | undefined>()
  const invoices = ref<IInvoice[]>([])

  // ---------- Fetch data ----------
  const loadData = async () => {
    item.value = await itemRepo.get(id)
    invoices.value = await invoiceRepo.getAll()
  }

  await loadData()

  // ---------- Derived ----------
  /**
   * Flatten matched line items with their parent invoice for table rows.
   */
  const invoiceRows = computed(() => {
    const rows: any[] = []
    invoices.value.forEach((inv) => {
      inv.items.forEach((line) => {
        if (line.id === id) {
          rows.push({
            invoiceNumber: inv.invoiceNumber,
            invoiceDate: inv.invoiceDate,
            quantity: line.quantity,
            lineTotal: line.quantity * line.rate,
            id: inv.id,
          })
        }
      })
    })
    return rows
  })

  const totalSold = computed(() => invoiceRows.value.reduce((sum, r) => sum + r.lineTotal, 0))

  const invoiceColumns = [
    {
      accessorKey: 'invoiceNumber',
      label: 'Invoice #',
      cell: (cell: any) =>
        h(
          resolveComponent('NuxtLink'),
          { to: `/invoice/${cell.row.original.id}` },
          { default: () => cell.getValue() }
        ),
    },
    { accessorKey: 'invoiceDate', label: 'Date' },
    { accessorKey: 'quantity', label: 'Qty' },
    {
      accessorKey: 'lineTotal',
      label: 'Line Total',
      cell: (cell: any) =>
        Number(cell.getValue()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
  ]
</script>

<style scoped></style>
