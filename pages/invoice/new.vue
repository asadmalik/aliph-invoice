<template>
  <UContainer class="flex flex-col gap-6">

    <!-- Form‐level error -->
    <div v-if="errors.form" class="text-red-700 bg-red-100 p-3 rounded">
      {{ errors.form }}
    </div>

    <!-- Customer / Meta -->
    <UFormField label="Customer Name" label-placement="bottom">
      <CustomerSelect v-model="selectedCustomerId" @select="setCustomer" />
      <template #error>
        <p v-if="errors.customer" class="text-red-600 text-sm">
          {{ errors.customer }}
        </p>
      </template>
    </UFormField>

    <UFormField label="Invoice #" size="lg">
      <UInput v-model="invoice.invoiceNumber" class="w-96" />
      <template #error>
        <p v-if="errors.invoiceNumber" class="text-red-600 text-sm">
          {{ errors.invoiceNumber }}
        </p>
      </template>
    </UFormField>

    <div class="flex flex-wrap gap-7">
      <UFormField label="Invoice Date">
        <UInput v-model="invoice.invoiceDate" type="date" class="w-72" />
      </UFormField>
      <UFormField label="Terms">
        <USelect v-model="invoice.terms" :items="termsOptions" class="w-72" />
      </UFormField>
      <UFormField label="Due Date">
        <UInput v-model="invoice.dueDate" type="date" class="w-72" readonly />
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
      <template #footer>
        <p v-if="errors.items" class="text-red-600 text-sm">
          {{ errors.items }}
        </p>
      </template>
    </UCard>

    <!-- Totals -->
    <div class="self-end w-80 mt-6 space-y-1 text-sm">
      <div class="flex justify-between">
        <span>Sub-Total:</span>
        <span>{{ fmt(subTotal) }}</span>
      </div>
      <div class="flex justify-between">
        <span>Tax Deducted:</span>
        <span>{{ fmt(totalTax) }}</span>
      </div>
      <div class="border-t pt-1 flex justify-between font-semibold text-lg">
        <span>Grand Total:</span>
        <span>{{ fmt(grandTotal) }}</span>
      </div>
    </div>

    <!-- Save -->
    <div class="mt-8 self-end">
      <UButton color="primary" :loading="isSaving" :disabled="!isValid || isSaving" @click="saveInvoice">
        Save Invoice
      </UButton>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
  import type { ICustomer, IInvoice, IInvoiceItem } from '@/DataLayer/types'
import { useInvoiceRepo } from '@/composables/useRepos'
import { computed, onMounted, reactive, ref, toRaw, watch } from 'vue'
import CustomerSelect from '~/components/ui/CustomerSelect.vue'
import InvoiceItemsTable from '~/components/ui/InvoiceItemsTable.vue'

  const isClient = import.meta.client
  const repo = isClient ? useInvoiceRepo() : null

  // State
  const invoice = reactive<IInvoice>({
    customerId: null,
    customerName: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    terms: 'Due On Receipt',
    dueDate: '',
    billTo: '',
    currencyCode: 'USD',
    items: [],
    notes: '',
    discount: 0,
    shipping: 0
  })

  const selectedCustomerId = ref<number | null>(null)
  const isSaving = ref(false)
  const errors = reactive({
    customer: null as string | null,
    invoiceNumber: null as string | null,
    items: null as string | null,
    form: null as string | null
  })

  // Formatting helper
  const fmt = (n: number) => `$${n.toFixed(2)}`

  // Computed totals
  const subTotal = computed(() =>
    invoice.items.reduce((sum, row) => sum + (row.qty * row.rate - row.tax), 0)
  )
  const totalTax = computed(() =>
    invoice.items.reduce((sum, row) => sum + row.tax, 0)
  )
  const grandTotal = computed(() => subTotal.value + totalTax.value)

  // Term options
  const termsOptions = [
    { label: 'Due On Receipt', value: 'Due On Receipt' },
    { label: 'Net 15', value: 'Net 15' },
    { label: 'Net 30', value: 'Net 30' }
  ]

  // Generate a blank line item
  function blankItem(): IInvoiceItem {
    return { id: Date.now(), item: '', qty: 1, rate: 0, tax: 0, amount: 0 }
  }

  // Sync child table back into invoice
  function syncItems(rows: IInvoiceItem[]) {
    invoice.items = rows
  }

  // Auto‐set due date when date or terms change
  watch(
    () => [invoice.invoiceDate, invoice.terms],
    ([date, terms]) => {
      if (!date) {
        invoice.dueDate = ''
        return
      }
      const d = new Date(date)
      const match = terms.match(/Net (\d+)/)
      const offset = match ? parseInt(match[1], 10) : 0
      d.setDate(d.getDate() + offset)
      invoice.dueDate = d.toISOString().split('T')[0]
    },
    { immediate: true }
  )

  // Reset form + fetch next invoice number
  async function resetInvoice() {
    if (!repo) return
    errors.form = null
    try {
      const nextNum = await repo.getNextNumber()
      invoice.items = [blankItem()]
      invoice.customerId = null
      invoice.customerName = ''
      invoice.invoiceNumber = nextNum
      invoice.notes = ''
      invoice.discount = 0
      invoice.shipping = 0
      invoice.terms = 'Due On Receipt'
      invoice.invoiceDate = new Date().toISOString().split('T')[0]
    } catch (err: any) {
      console.error(err)
      errors.form = 'Unable to fetch next invoice number. Please try again later.'
    }
  }

  onMounted(resetInvoice)

  // Validation logic
  const isValid = computed(() => {
    return (
      !!invoice.customerId &&
      invoice.invoiceNumber.trim().length > 0 &&
      invoice.items.length > 0 &&
      invoice.items.every(
        (it) => it.item.trim() && it.qty > 0 && it.rate >= 0
      )
    )
  })

  function validateInvoice() {
    errors.customer = invoice.customerId ? null : 'Please select a customer.'
    errors.invoiceNumber = invoice.invoiceNumber.trim()
      ? null
      : 'Invoice number cannot be empty.'
    if (!invoice.items.length) {
      errors.items = 'At least one line item is required.'
    } else {
      const bad = invoice.items.find(
        (it) => !it.item.trim() || it.qty <= 0 || it.rate < 0
      )
      errors.items = bad
        ? 'All items must have a description, quantity ≥1, and non-negative rate.'
        : null
    }
    return !errors.customer && !errors.invoiceNumber && !errors.items
  }

  // Handle customer selection
  function setCustomer(c: ICustomer) {
    selectedCustomerId.value = c.id!
    invoice.customerId = c.id!
    invoice.customerName = c.name
    errors.customer = null
  }

  // Save
  async function saveInvoice() {
    errors.form = null
    if (!repo) {
      errors.form = 'Storage not available. Please reload and try again.'
      return
    }
    if (!validateInvoice()) return

    isSaving.value = true
    try {
      await repo.addWithItems(toRaw(invoice))
      await resetInvoice()
      alert('✅ Invoice successfully saved!')
    } catch (err: any) {
      console.error(err)
      errors.form = 'Save failed. Please check your data and try again.'
    } finally {
      isSaving.value = false
    }
  }
</script>
