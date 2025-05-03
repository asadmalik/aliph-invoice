<template>
  <UContainer class="flex flex-col gap-6">

    <!-- Customer / Meta -->
    <UFormField label="Customer Name" label-placement="bottom">
      <CustomerSelect v-model="selectedCustomerId" @select="setCustomer" />
    </UFormField>

    <UFormField label="Invoice #" size="lg">
      <UInput v-model="invoice.invoiceNumber" class="w-96" />
    </UFormField>

    <div class="flex flex-wrap gap-7">
      <UFormField label="Invoice Date">
        <UInput v-model="invoice.invoiceDate" type="date" class="w-72" />
      </UFormField>
      <UFormField label="Terms">
        <USelect v-model="invoice.terms" :items="termsOptions" class="w-72" />
      </UFormField>
      <UFormField label="Due Date">
        <UInput v-model="invoice.dueDate" type="date" class="w-72" />
      </UFormField>
    </div>

    <!-- Items Table -->
    <UCard>
      <template #header>
        <UText tag="h2" class="text-lg font-semibold">Item Details</UText>
      </template>

      <InvoiceItemsTable
:items-table="invoice.items" @item-added="syncItems" @item-removed="syncItems"
        @item-updated="syncItems" />
    </UCard>

    <!-- Totals -->
    <div class="self-end w-80 mt-6 space-y-1 text-sm">
      <div class="flex justify-between"><span>Sub‑Total:</span><span>{{ fmt(subTotal) }}</span></div>
      <div class="flex justify-between"><span>Tax Deducted:</span><span>{{ fmt(totalTax) }}</span></div>
      <div class="border-t pt-1 flex justify-between font-semibold text-lg">
        <span>Grand Total:</span><span>{{ fmt(grandTotal) }}</span>
      </div>
    </div>

    <!-- Save -->
    <div class="mt-8 self-end">
      <UButton color="primary" @click="saveInvoice">Save Invoice</UButton>
    </div>

  </UContainer>
</template>

<script setup lang="ts">
  /* --------------------------------------------------------------- *
   * imports & helpers                                               *
   * --------------------------------------------------------------- */
  import type { ICustomer, IInvoice, IInvoiceItem } from '@/DataLayer/types'
import { useInvoiceRepo } from '@/composables/useRepos'
import CustomerSelect from '~/components/ui/CustomerSelect.vue'
import InvoiceItemsTable from '~/components/ui/InvoiceItemsTable.vue'

  const isClient = import.meta.client
  const repo = isClient ? useInvoiceRepo() : null                 // undefined on SSR
  const fmt = (n: number) => `$${n.toFixed(2)}`                  // currency helper

  /* --------------------------------------------------------------- *
   * invoice reactive object                                         *
   * --------------------------------------------------------------- */
  function blankItem(): IInvoiceItem {
    return { id: Date.now(), item: '', qty: 1, rate: 0, tax: 0, amount: 0 }
  }

  const invoice = reactive<IInvoice>({
    customerId: null,
    customerName: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    terms: 'Due On Receipt',
    dueDate: '',
    billTo: '',
    currencyCode: 'USD',
    items: [blankItem()],
    notes: '',
    discount: 0,
    shipping: 0
  })

  /* --------------------------------------------------------------- *
   * live totals (computed from qty / rate / tax every render)       *
   * --------------------------------------------------------------- */
  const subTotal = computed(() =>
    invoice.items.reduce((s, r) => s + (r.qty * r.rate - r.tax), 0)
  )
  const totalTax = computed(() => invoice.items.reduce((s, r) => s + r.tax, 0))
  const grandTotal = computed(() => subTotal.value + totalTax.value)

  /* --------------------------------------------------------------- *
   * reset form (client‑only)                                        *
   * --------------------------------------------------------------- */
  async function resetInvoice() {
    if (!repo) return
    const nextNum = await repo.getNextNumber()

    Object.assign(invoice, {
      customerId: null,
      customerName: '',
      invoiceNumber: nextNum,
      invoiceDate: new Date().toISOString().split('T')[0],
      terms: 'Due On Receipt',
      dueDate: '',
      billTo: '',
      items: [blankItem()],
      notes: '',
      discount: 0,
      shipping: 0
    })
  }

  onMounted(resetInvoice)

  /* --------------------------------------------------------------- *
   * customer picker                                                 *
   * --------------------------------------------------------------- */
  const selectedCustomerId = ref<number | null>(null)
  function setCustomer(c: ICustomer) {
    selectedCustomerId.value = c.id!
    invoice.customerId = c.id!
    invoice.customerName = c.name
  }

  /* --------------------------------------------------------------- *
   * term options                                                    *
   * --------------------------------------------------------------- */
  const termsOptions = [
    { label: 'Due On Receipt', value: 'Due On Receipt' },
    { label: 'Net 15', value: 'Net 15' },
    { label: 'Net 30', value: 'Net 30' }
  ]

  /* --------------------------------------------------------------- *
   * items sync from child table                                     *
   * --------------------------------------------------------------- */
  function syncItems(rows: IInvoiceItem[]) {
    invoice.items = rows
  }

  /* --------------------------------------------------------------- *
   * save                                                            *
   * --------------------------------------------------------------- */
  async function saveInvoice() {
    if (!repo) return
    try {
      const id = await repo.addWithItems(toRaw(invoice))
      console.log(`Invoice #${id} saved!`)
      await resetInvoice()
    } catch (err) {
      console.error(err)
      alert('Save failed.')
    }
  }
</script>

