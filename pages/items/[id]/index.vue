<!-- eslint-disable vue/first-attribute-linebreak -->
<!--  pages\items\[id]\index.vue  -->
<template>
  <div class="max-w-screen-xl mx-auto p-4 sm:p-6 space-y-8">
    <!-- Back link -->
    <NuxtLink to="/items" class="text-primary-600 hover:underline flex items-center gap-1">
      <i class="i-lucide-arrow-left w-4 h-4" />
      Back to Items
    </NuxtLink>

    <!-- Primary Item Info Card (name + edit) -->
    <UCard v-if="item">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-800">
            {{ item.name }}
          </h2>
          <UButton icon="i-heroicons-pencil-square" size="sm" color="gray" variant="ghost"
            :to="`/items/${item.id}/edit`" title="Edit Item" />
        </div>
      </template>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-sm text-gray-700">
        <div>
          <div class="text-muted text-xs uppercase tracking-wide">HS Code</div>
          <div class="font-medium">{{ item.hsCode || '—' }}</div>
        </div>
        <div>
          <div class="text-muted text-xs uppercase tracking-wide">UOM Code</div>
          <div class="font-medium">{{ item.uomCode || '—' }}</div>
        </div>
        <div>
          <div class="text-muted text-xs uppercase tracking-wide">Description</div>
          <div class="font-medium">
            {{ item.description || 'No description provided.' }}
          </div>
        </div>
        <div>
          <div class="text-muted text-xs uppercase tracking-wide">Location</div>
          <div class="font-medium">{{ item.location || '—' }}</div>
        </div>
        <div>
          <div class="text-muted text-xs uppercase tracking-wide">FBR Sale Type</div>
          <div class="font-medium">{{ item.fbrSaleType || '—' }}</div>
        </div>
        <div>
          <div class="text-muted text-xs uppercase tracking-wide">Sales Tax Rate</div>
          <div class="font-medium">
            {{ item.defaultSalesTaxRate?.toFixed(2) ?? '0.00' }}%
          </div>
        </div>
      </div>
    </UCard>

    <!-- Summary Stats Card -->
    <UCard v-if="item" :ui="{ body: 'space-y-4' }">
      <template #header>
        <h3 class="text-base font-semibold">Sales Summary</h3>
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
 
import type { IInvoice, IItem } from '@/DataLayer/types'

  const route = useRoute()
  const id = Number(route.params.id)

  const item = ref<IItem | null>(null)
  const invoices = ref<IInvoice[]>([])

  const loading = ref(true)

  onMounted(async () => {
    if (!import.meta.client) return
    const itemData = await useItemRepo().get(id)
    const invoiceData = await useInvoiceRepo().getByHsCode(item.value?.hsCode ?? '')

    item.value = itemData ?? null
    invoices.value = invoiceData ?? []
    loading.value = false
  })

  const invoiceRows = computed(() => {
    if (!item.value) return []
    const rows: any[] = []
    invoices.value.forEach((inv) => {
      inv.items.forEach((line) => {
        if (line.item === item.value?.name) {
          rows.push({
            invoiceNumber: inv.invoiceNumber,
            invoiceDate: inv.invoiceDate,
            quantity: line.qty,
            lineTotal: line.qty * line.rate,
            id: inv.id,
          })
        }
      })
    })
    return rows
  })

  const totalSold = computed(() =>
    invoiceRows.value.reduce((sum, r) => sum + r.lineTotal, 0)
  )

  const invoiceColumns = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
      cell: ({ row }: any) =>
        h(resolveComponent('NuxtLink'), { to: `/invoice/${row.original.id}` }, () =>
          row.getValue('invoiceNumber')
        ),
    },
    { accessorKey: 'invoiceDate', header: 'Date' },
    { accessorKey: 'quantity', header: 'Qty' },
    {
      accessorKey: 'lineTotal',
      header: 'Line Total',
      cell: ({ getValue }: any) =>
        Number(getValue()).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
  ]
</script>


<style scoped></style>
