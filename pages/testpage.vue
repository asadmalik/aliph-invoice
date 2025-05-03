<template>
  <UContainer as="div" class="max-w-4xl mx-auto p-6 space-y-6">
    <!-- …your header fields like customer select, invoice date, etc… -->

    <!-- Invoice line-items table -->
    <InvoiceItemsTable
      :items-table="lineItems"
      @loaded="onTableLoaded"
      @item-added="onItemsChanged"
      @item-removed="onItemsChanged"
    />

    <!-- Totals & Save -->
    <div class="flex justify-end items-center space-x-8 mt-4">
      <div class="text-xl font-semibold">Total: {{ totalAmount.toFixed(2) }}</div>
      <UButton @click="saveInvoice">Save Invoice</UButton>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
//import { ref, computed } from 'vue'
//import InvoiceRepository from '~/DataLayer/repositories/InvoiceRepository'
import type { IInvoiceItem } from '~/DataLayer/types';

import InvoiceItemsTable from '~/components/ui/InvoiceItemsTable.vue';

// 1. reactive backing array for the table
const lineItems = ref<IInvoiceItem[]>([

])

// 2. compute total whenever items change
const totalAmount = computed(() =>
  lineItems.value.reduce((sum, it) => sum + it.amount, 0)
)

// 3. event handlers
function onTableLoaded() {
  // if you have defaults, you could initialize here
}

function onItemsChanged() {
  // nothing needed: totalAmount recomputes
  // but you could also sync it back into an `invoice` object if you like
}

// 4. save everything
async function saveInvoice() {
  /* const invoiceRepo = useInvoiceRepo();
  const invoice: Omit<IInvoice, 'id'> = {
    customerId: 1,
    date: new Date().toISOString(),
    items: lineItems.value,
    total: totalAmount.value,
    // …any other invoice fields…
  }
  const newId = await invoiceRepo.add(invoice)
  // navigate to detail or show a toast… */
}
</script>
