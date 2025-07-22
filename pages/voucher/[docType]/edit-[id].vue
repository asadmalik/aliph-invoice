<template>
  <UContainer class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex justify-between items-start">
      <div>
        <UText tag="h1" class="text-2xl font-bold">{{ pageTitle }}</UText>
        <p class="text-sm text-gray-600 mt-1">Invoice #: {{ invoice.invoiceNumber }}</p>
      </div>
      <UBadge :color="{
        draft: 'info',
        validated: 'primary',
        posted: 'success',
        validation_failure: 'error',
      }[invoice.meta.status]" class="uppercase px-3 py-1 rounded">
        {{ invoice.meta.status }}
      </UBadge>
    </div>

    <!-- Buyer Info -->
    <div class="grid grid-cols-2 gap-8">
      <div class="space-y-4">
        <UFormField label="Buyer Name" label-placement="bottom" :error="errors.customer" :disabled="isBusy">
          <CustomerSelect v-model="invoice.customerId" :disabled="isBusy" @select="setCustomer" />
        </UFormField>
      </div>
    </div>

    <!-- Invoice Meta -->
    <div class="flex flex-wrap gap-6 mt-4">
      <UFormField label="Scenario" :disabled="isBusy">
        <USelect v-model="invoice.scenarioId" :items="scenarioOptions" :disabled="isBusy"
          @update:model-value="onScenarioChange" />
      </UFormField>
      <UFormField label="Transaction Type" :disabled="isBusy">
        <USelect v-model="invoice.transactionTypeId" :items="transactionTypeOptions" :disabled="isBusy" />
      </UFormField>

      <UFormField label="Invoice Date" :disabled="isBusy">
        <UInput v-model="invoice.invoiceDate" type="date" class="w-48" :disabled="isBusy" />
      </UFormField>
      <UFormField label="Due Date">
        <UInput v-model="invoice.meta.dueDate" type="date" class="w-48" readonly />
      </UFormField>
      <UFormField v-if="showTerms" label="Terms" :disabled="isBusy">
        <USelect v-model="invoice.meta.terms" :items="termsOptions" class="w-48" :disabled="isBusy" />
      </UFormField>
    </div>

    <!-- Items Table -->
    <UCard class="mt-6" :ui="{ opacity: isBusy ? 'opacity-50' : '' }">
      <template #header>
        <UText tag="h2" class="text-lg font-semibold">Item Details</UText>
      </template>
      <InvoiceItemsTable :items-table="invoice.items ?? []" :status="invoice.meta.status" :scenario="invoice.scenarioId"
        :sale-type="invoice.meta.saleType" :disabled="isBusy" @item-added="syncItems" @item-removed="syncItems"
        @item-updated="syncItems" />
      <template #footer>
        <p v-if="errors.items" class="text-red-600 text-sm">{{ errors.items }}</p>
      </template>
    </UCard>

    <!-- Totals & Extras -->
    <div class="grid grid-cols-2 gap-8 mt-6">
      <div class="space-y-4">
        <UFormField label="Header Discount" :disabled="isBusy">
          <UInput v-model.number="invoice.discount" type="number" :disabled="isBusy" />
        </UFormField>
        <UFormField label="Shipping" :disabled="isBusy">
          <UInput v-model.number="invoice.shipping" type="number" :disabled="isBusy" />
        </UFormField>
        <UFormField label="Notes" :disabled="isBusy">
          <UTextarea v-model="invoice.meta.notes" :rows="3" :disabled="isBusy" />
        </UFormField>
      </div>

      <div class="self-end w-80 space-y-1 text-sm">
        <div class="flex justify-between"><span>Sub-Total:</span><span>{{ fmt(subTotal) }}</span></div>
        <div class="flex justify-between"><span>Sales Tax:</span><span>{{ fmt(totalSalesTax) }}</span></div>
        <div class="flex justify-between"><span>Withheld Tax:</span><span>-{{ fmt(totalWithheldTax) }}</span></div>
        <div class="flex justify-between"><span>Extra Tax:</span><span>{{ fmt(totalExtraTax) }}</span></div>
        <div class="flex justify-between"><span>Line Discounts:</span><span>-{{ fmt(totalLineDiscount) }}</span></div>
        <div class="flex justify-between"><span>Header Discount:</span><span>-{{ fmt(invoice.discount) }}</span></div>
        <div class="flex justify-between"><span>Shipping:</span><span>{{ fmt(invoice.shipping) }}</span></div>
        <div class="border-t pt-1 flex justify-between font-semibold text-lg">
          <span>Grand Total:</span><span>{{ fmt(grandTotal) }}</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2 self-end mt-8">
      <UButton v-if="invoice.meta.status === 'draft'" color="primary" :loading="isBusy" :disabled="!isValid || isBusy"
        @click="validateInvoice">
        Validate
      </UButton>
      <UButton v-else-if="invoice.meta.status === 'validated'" color="secondary" :loading="isBusy" :disabled="isBusy"
        @click="postInvoice">
        Post Invoice
      </UButton>
      <UButton v-if="invoice.meta.status === 'posted'" color="success" @click="printInvoice">
        Print Tax Invoice
      </UButton>
    </div>
  </UContainer>
</template>

<script setup lang="ts">

  import type { ICustomer, IInvoice, IInvoiceItem, InvoiceStatus } from '@/DataLayer/types'
  import { useCustomerRepo, useInvoiceRepo, useTransactionTypeRepo } from '@/composables/useRepos'


  import CustomerSelect from '~/components/ui/CustomerSelect.vue'
  import InvoiceItemsTable from '~/components/ui/InvoiceItemsTable.vue'
  //import { toDiPayload, validateInvoicePayload } from '~/services/diClient'
  import { postInvoicePayload, toDiPayload, validateInvoicePayload } from '~/services/diClient'

  // — Page Meta & Title —
  const route = useRoute()
  const docType = (route.params.docType as 'sale' | 'purchase' | 'credit') || 'sale'
  console.log('Doc Type:', docType);


  const pageTitle = computed(() =>
    docType === 'credit'
      ? 'Edit Credit Note'
      : `Edit ${docType.charAt(0).toUpperCase() + docType.slice(1)} Invoice`
  )
  definePageMeta({ layout: 'default', title: 'Edit Invoice' })
  useHead({ title: pageTitle.value })
  useSeoMeta({ title: pageTitle.value, description: 'Validate or post your invoice.' })

  // — Repos & Lookups —
  const invoiceRepo = useInvoiceRepo()
  const itemsRepo = useItemRepo();
  const customerRepo = useCustomerRepo()
  const transTypeRepo = useTransactionTypeRepo()

  const scenarioOptions = [
    { label: 'SNO01 — Local Taxable', value: 'SNO01', saleType: 'Goods at Standard Rate' },
    { label: 'SNO17 — Export Zero-Rated', value: 'SNO17', saleType: 'Export of Goods' },
  ]
  const termsOptions = [
    { label: 'Due On Receipt', value: 'Due On Receipt' },
    { label: 'Net 15', value: 'Net 15' },
    { label: 'Net 30', value: 'Net 30' },
  ]

  const transactionTypeOptions = ref<{ label: string; value: number }[]>([])
  const customerOptions = ref<ICustomer[]>([])

  // — Helpers —
  function todayIso(): string {
    return new Date().toISOString().split('T')[0]
  }
  function formatDMY(iso: string): string {
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  }

  // — State & Flags —
  const isBusy = ref(false)
  const errors: any = reactive({ customer: null, items: null, form: null })

  // — Reactive Invoice ---
  const invoice = reactive<IInvoice>({
    id: route.params.id ? Number(route.params.id) : 0,
    invoiceNumber: '',
    customerId: 0,
    invoiceDate: todayIso(),
    items: [] as IInvoiceItem[],
    discount: 0,
    shipping: 0,
    invoiceValue: 0,
    fbrInvoiceNumber: undefined,
    scenarioId: scenarioOptions[0].value,
    transactionTypeId: transactionTypeOptions.value[0]?.value || 1,
    validation: { attempts: [], lastStatus: 'draft' as InvoiceStatus },
    meta: {
      dueDate: todayIso(),
      currencyCode: 'PKR',
      saleType: scenarioOptions[0].saleType,
      status: 'draft',
      notes: '',
      termsAndConditions: '',
      terms: termsOptions[0].value,
      createdAt: formatDMY(todayIso()),
      createdBy: 'system',
      updatedAt: undefined,
      updatedBy: undefined,
    },
  })

  // — Compute totals & UI logic —
  const subTotal = computed(() => invoice.items.reduce((s, r) => s + (r.valueSalesExcludingST ?? r.quantity * r.rate), 0))
  const totalSalesTax = computed(() => invoice.items.reduce((s, r) => s + (r.salesTaxApplicable ?? 0), 0))
  const totalWithheldTax = computed(() => invoice.items.reduce((s, r) => s + (r.salesTaxWithheldAtSource ?? 0), 0))
  const totalExtraTax = computed(() => invoice.items.reduce((s, r) => s + (r.extraTax ?? 0) + (r.furtherTax ?? 0) + (r.fedPayable ?? 0), 0))
  const totalLineDiscount = computed(() => invoice.items.reduce((s, r) => s + (r.lineDiscount ?? 0), 0))
  const grandTotal: ComputedRef<number> = computed(() =>
    subTotal.value + totalSalesTax.value + totalExtraTax.value
    - totalWithheldTax.value - totalLineDiscount.value
    - (invoice.discount || 0) + (invoice.shipping || 0)
  )
  const fmt = (n: number) => n.toFixed(2)
  const showTerms = computed(() => docType !== 'credit')
  const isValid = computed(() => invoice.customerId > 0 && invoice.items.length > 0)

  // — Lifecycle: load invoice & lookups —
  onMounted(async () => {
    isBusy.value = true
    await nextTick()

    // load lookup data
    const [txTypes, customers] = await Promise.all([
      transTypeRepo.getAll(),
      customerRepo.getAll(),
    ])
    transactionTypeOptions.value = txTypes.map(t => ({
      label: t.transaction_DESC,
      value: t.transaction_TYPE_ID,
    }))
    customerOptions.value = customers
    console.log('customers: ', customers);

    const id = Number(route.params.id)
    if (!isNaN(id)) {
      const header = await invoiceRepo.get(id)
      if (header) {
        // assign all header fields except items
        invoice.id = header.id
        invoice.invoiceNumber = header.invoiceNumber
        invoice.customerId = header.customerId
        invoice.invoiceDate = header.invoiceDate
        invoice.discount = header.discount
        invoice.shipping = header.shipping
        invoice.invoiceTotalValue = header.invoiceTotalValue
        invoice.fbrInvoiceNumber = header.fbrInvoiceNumber
        invoice.scenarioId = header.scenarioId
        invoice.transactionTypeId = header.transactionTypeId

        // assign meta & validation
        Object.assign(invoice.meta, header.meta)
        Object.assign(invoice.validation, header.validation)
      }

      // 3️⃣ Fetch items separately
      const items = await invoiceRepo.getInvoiceItems(id)
      console.log('Fetched items:', items, id);

      invoice.items = items ?? []
    }

    isBusy.value = false
  })

  // — Clear validation when invoice changes after validate —
  watch(
    [
      () => invoice.customerId,
      () => invoice.scenarioId,
      () => invoice.transactionTypeId,
      () => invoice.invoiceDate,
      () => invoice.meta.terms,
      () => JSON.stringify(invoice.items),
    ],
    () => {
      if (invoice.meta.status === 'validated') {
        invoice.meta.status = 'draft'
        invoice.validation.lastStatus = 'draft'
      }
    }
  )

  // — Handlers ---
  function setCustomer(c: ICustomer) {
    invoice.customerId = c.id!
    errors.customer = null
  }

  function onScenarioChange(scn: string) {
    const s = scenarioOptions.find(x => x.value === scn)!
    invoice.meta.saleType = s.saleType
    invoice.transactionTypeId = transTypeRepo.getDefaultTransactionTypeId(s.saleType)
  }

  function syncItems(rows: IInvoiceItem[]) {
    invoice.items = rows
  }

  watch(
    [() => invoice.invoiceDate, () => invoice.meta.terms] as const,
    ([d, t]) => {
      if (!d) {
        invoice.meta.dueDate = ''
        return
      }
      const dt = new Date(d)
      const m = t.match(/Net\s+(\d+)/i)
      if (m) dt.setDate(dt.getDate() + parseInt(m[1], 10))
      invoice.meta.dueDate = dt.toISOString().split('T')[0]
    },
    { immediate: true }
  )

  function validateForm() {
    errors.customer = invoice.customerId > 0 ? null : 'Please select a buyer.'
    errors.items = invoice.items?.length > 0 ? null : 'At least one line item is required.'
    return !errors.customer && !errors.items
  }

  async function validateInvoice() {
    if (isBusy.value) return
    if (!validateForm()) return
    isBusy.value = true
    try {
      // save latest draft first
      await saveDraft()
      // call DI validate
      const payload = toDiPayload(invoice)
      const res = await validateInvoicePayload(payload)
      invoice.validation.attempts?.push({
        timestamp: new Date().toISOString(),
        statusCode: res.statusCode,
        message: res.errorMessage || 'Validation OK',
        validationReferenceNo: res.validationReferenceNo,
      })
      invoice.meta.status = res.statusCode === '00' ? 'validated' : 'validation_failure'
      // persist status & attempts
      await invoiceRepo.update(invoice.id!, {
        meta: invoice.meta,
        validation: invoice.validation,
      })
    } catch (err: any) {
      console.error(err)
      invoice.validation.attempts.push({
        timestamp: new Date().toISOString(),
        statusCode: 'XX',
        message: err.message,
        validationReferenceNo: '',
      })
      invoice.meta.status = 'validation_failure'
    } finally {
      isBusy.value = false
    }
  }

  async function postInvoice() {
    if (isBusy.value) return
    isBusy.value = true
    try {
      await saveDraft()
      const payload = toDiPayload(invoice)
      const res = await postInvoicePayload(payload)
      invoice.fbrInvoiceNumber = res.FbrInvoiceNumber
      invoice.meta.status = 'posted'
      invoice.meta.updatedAt = formatDMY(todayIso())
      invoice.meta.updatedBy = 'system'
      invoice.validation.attempts.push({
        timestamp: new Date().toISOString(),
        statusCode: res.statusCode,
        message: 'Posted successfully',
        validationReferenceNo: res.FbrInvoiceNumber,
      })
      await invoiceRepo.update(invoice.id!, {
        fbrInvoiceNumber: invoice.fbrInvoiceNumber,
        meta: invoice.meta,
        validation: invoice.validation,
      })
    } catch (err) {
      console.error(err)
    } finally {
      isBusy.value = false
    }
  }

  async function saveDraft() {
    if (!validateForm()) throw new Error('Validation failed')
    if (!invoice.id) {
      invoice.invoiceNumber = await invoiceRepo.getNextInvoiceNumber()
    }
    invoice.invoiceValue = grandTotal.value
    const nowIso = todayIso()
    invoice.meta.updatedAt = formatDMY(nowIso)
    invoice.meta.updatedBy = 'system'
    const id = await invoiceRepo.saveDraft(invoice)
    invoice.id = id
  }

  function printInvoice() {
    window.print()
  }
</script>
