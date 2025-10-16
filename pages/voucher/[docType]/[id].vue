// pages/voucher/[docType]/[id]/index.vue
<template>
    <UContainer class="py-6 print:py-0 ">
        <!-- ACTIONS (hidden when printing) -->
        <div class="mb-6 flex flex-wrap items-center justify-end gap-2 print:hidden">
            <UButton icon="i-heroicons-pencil-square" variant="soft" :disabled="!invoice?.id" @click="goEdit">Edit
            </UButton>
            <UButton icon="i-heroicons-check-badge" color="primary" :loading="loading.validate"
                :disabled="!invoice?.items?.length || isValidated" @click="validateInvoice">Validate</UButton>
            <UButton icon="i-heroicons-paper-airplane" color="success" :loading="loading.post"
                :disabled="!isValidated || posted" @click="postInvoice">Post</UButton>
            <UButton icon="i-heroicons-printer" variant="soft" :disabled="!invoice" @click="printPage">Print</UButton>
        </div>

        <!-- SHEET -->
        <div class="mx-auto max-w-4xl p-6 sm:p-10 print:p-0">
            <!-- HEADER -->
            <div class="flex items-start justify-between gap-6">
                <!-- Left: Logo + Seller -->
                <div class="flex items-start gap-4">
                    <img src="/assets/img/aliphmarketing_LOGO_SYMBOL.svg" alt="Logo" class="size-14 object-contain">
                    <div class="text-sm leading-6">
                        <div class="font-semibold">Asad Malik</div>
                        <div>Pakistan</div>
                        <div><a href="mailto:asadmalik.pk@gmail.com" class="hover:underline">asadmalik.pk@gmail.com</a>
                        </div>
                        <div><a href="https://asadmalik.dev" class="hover:underline">https://asadmalik.dev</a></div>
                    </div>
                </div>

                <!-- Right: Title + Number + Balance Due -->
                <div class="text-right">
                    <div class="text-4xl font-light">Invoice</div>
                    <div class="mt-1 text-xs text-gray-500"># {{ invoice?.invoiceNumber || '—' }}</div>
                    <div class="mt-6">
                        <div class="text-xs uppercase text-gray-500">Balance Due</div>
                        <div class="text-2xl font-semibold">{{ fmt(grandTotal) }}</div>
                    </div>
                </div>
            </div>

            <!-- PARTY + META -->
            <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div class="text-sm leading-6">
                    <div class="font-semibold">Everstream Analytics</div>
                    <div>Atlanta</div>
                    <div>Georgia</div>
                    <div>U.S.A</div>
                </div>

                <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                    <div class="text-right text-gray-600">Invoice Date :</div>
                    <div class="font-medium">{{ dmy(invoice?.invoiceDate) }}</div>

                    <div class="text-right text-gray-600">Terms :</div>
                    <div class="font-medium">{{ invoice?.meta?.terms || invoice?.terms || 'Due on Receipt' }}</div>

                    <div class="text-right text-gray-600">Due Date :</div>
                    <div class="font-medium">{{ dmy(invoice?.meta?.dueDate || invoice?.dueDate) }}</div>
                </div>
            </div>

            <!-- SUBJECT -->
            <div class="mt-8 space-y-1 text-sm">
                <div class="text-gray-600">Subject :</div>
                <div class="font-medium">
                    {{ subjectLine }}
                </div>
            </div>

            <!-- ITEMS TABLE -->
            <div class="mt-6 overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead>
                        <tr class="bg-neutral-700 text-white">
                            <th class="w-12 px-3 py-2 text-right font-semibold">#</th>
                            <th class="px-3 py-2 text-left font-semibold">Description</th>
                            <th class="px-3 py-2 text-right font-semibold">Qty</th>
                            <th class="px-3 py-2 text-right font-semibold">Rate</th>
                            <th class="px-3 py-2 text-right font-semibold">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, i) in simpleRows" :key="i" class="border-b border-gray-200">
                            <td class="px-3 py-2 text-right text-gray-700">{{ i + 1 }}</td>
                            <td class="px-3 py-2">{{ row.name }}</td>
                            <td class="px-3 py-2 text-right">{{ row.qty }}</td>
                            <td class="px-3 py-2 text-right">{{ fmt(row.rate) }}</td>
                            <td class="px-3 py-2 text-right">{{ fmt(row.amount) }}</td>
                        </tr>
                        <tr v-if="!simpleRows.length">
                            <td colspan="5" class="px-3 py-6 text-center text-gray-400">No items</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- TOTALS -->
            <div class="mt-2 flex justify-end">
                <table class="w-80 text-sm">
                    <tbody>
                        <tr class="border-t">
                            <td class="px-3 py-2 text-gray-600">Sub Total</td>
                            <td class="px-3 py-2 text-right">{{ fmt(subTotal) }}</td>
                        </tr>
                        <tr v-if="totalLineDiscount">
                            <td class="px-3 py-2 text-gray-600">Line Discounts</td>
                            <td class="px-3 py-2 text-right">-{{ fmt(totalLineDiscount) }}</td>
                        </tr>
                        <tr v-if="headerDiscount">
                            <td class="px-3 py-2 text-gray-600">Header Discount</td>
                            <td class="px-3 py-2 text-right">-{{ fmt(headerDiscount) }}</td>
                        </tr>
                        <tr v-if="shipping">
                            <td class="px-3 py-2 text-gray-600">Shipping</td>
                            <td class="px-3 py-2 text-right">{{ fmt(shipping) }}</td>
                        </tr>
                        <tr v-if="totalSalesTax || totalExtraTax || totalWithheldTax">
                            <td class="px-3 py-2 text-gray-600">Tax</td>
                            <td class="px-3 py-2 text-right">{{ fmt(totalSalesTax + totalExtraTax - totalWithheldTax) }}
                            </td>
                        </tr>
                        <tr class="border-t">
                            <td class="px-3 py-2 text-center font-medium">Total</td>
                            <td class="px-3 py-2 text-right font-medium">{{ fmt(grandTotal) }}</td>
                        </tr>
                        <tr class="bg-gray-100">
                            <td class="px-3 py-2 text-center font-semibold">Balance Due</td>
                            <td class="px-3 py-2 text-right font-semibold">{{ fmt(grandTotal) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- FOOTER -->
            <div class="mt-14 text-xs text-gray-600">
                <p>Thank you for your business.</p>
                <p class="mt-2">
                    <a class="underline" href="#">
                        Bank Details: IBAN A/c # PK12SCBL0000001263875401 Title: Asad Malik Standard Chartered Bank.
                        SWIFT/BIC Code: SCBLPKKX
                    </a>
                </p>
            </div>
        </div>
    </UContainer>
</template>

<script setup lang="ts">
    import { useRoute, useRouter } from '#imports'
    import { useCustomerRepo, useInvoiceRepo } from '@/composables/useRepos'
    import type { IInvoice, IInvoiceItem } from '@/DataLayer/types'

    definePageMeta({ layout: 'default', title: 'View Invoice' })
    useHead({ title: 'Invoice' })
    useSeoMeta({ title: 'Invoice', description: 'View invoice details.' })

    const route = useRoute()
    const router = useRouter()
    const invoiceRepo = useInvoiceRepo()
    const customerRepo = useCustomerRepo() // kept for future buyer detail enrichment if needed

    const invoice = ref<IInvoice | null>(null)
    const loading = reactive({ validate: false, post: false })

    const posted = computed(() => !!invoice.value?.fbrInvoiceNumber)
    const displayStatus = computed(() => invoice.value?.meta?.status || invoice.value?.status || 'draft')
    const isValidated = computed(() => ['validated', 'validation_success', 'posted'].includes(displayStatus.value))

    const fmt = (n?: number) => (Number(n || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const dmy = (iso?: string) => iso ? (() => { const [y, m, d] = iso.split('T')[0].split('-'); return `${d}/${m}/${y}` })() : '—'

    // subject line: override per your need
    const subjectLine = computed(() => {
        const iso = invoice.value?.invoiceDate
        if (!iso) return 'INVOICE'
        const date = new Date(iso)
        return `INVOICE FOR PERIOD: ${date.toLocaleString(undefined, { month: 'long', year: 'numeric' })}`
    })

    // rows for minimal table
    const simpleRows = computed(() => (invoice.value?.items || []).map((r: IInvoiceItem) => ({
        name: r.itemName || '—',
        qty: r.quantity,
        rate: r.rate,
        amount: r.valueSalesExcludingST ?? (r.quantity * r.rate)
    })))

    // totals (same math as your create page)
    const subTotal = computed(() => (invoice.value?.items || []).reduce((s, r) => s + (r.valueSalesExcludingST ?? r.quantity * r.rate), 0))
    const totalSalesTax = computed(() => (invoice.value?.items || []).reduce((s, r) => s + (r.salesTaxApplicable ?? 0), 0))
    const totalWithheldTax = computed(() => (invoice.value?.items || []).reduce((s, r) => s + (r.salesTaxWithheldAtSource ?? 0), 0))
    const totalExtraTax = computed(() => (invoice.value?.items || []).reduce((s, r) => s + (r.extraTax ?? 0) + (r.furtherTax ?? 0) + (r.fedPayable ?? 0), 0))
    const totalLineDiscount = computed(() => (invoice.value?.items || []).reduce((s, r) => s + (r.lineDiscount ?? 0), 0))
    const headerDiscount = computed(() => invoice.value?.discount ?? 0)
    const shipping = computed(() => invoice.value?.shipping ?? 0)
    const grandTotal = computed(() =>
        (subTotal.value + totalSalesTax.value + totalExtraTax.value) -
        (totalWithheldTax.value + totalLineDiscount.value + headerDiscount.value) +
        shipping.value
    )

    // actions
    function goEdit() {
        if (!invoice.value?.id) return
        router.push(`/voucher/${route.params.docType}/${invoice.value.id}/edit`)
    }
    function printPage() { window.print() }

    async function validateInvoice() {
        if (!invoice.value?.id) return
        loading.validate = true
        try {
            const res = await $fetch<{ statusCode: string; validationReferenceNo?: string }>('/api/di/validateinvoicedata', {
                method: 'POST', body: { id: invoice.value.id }
            })
            const ok = res.statusCode === '00'
            await invoiceRepo.update(invoice.value.id!, {
                status: ok ? 'validation_success' : 'validation_failure',
                meta: { ...(invoice.value.meta || {}), status: ok ? 'validated' : 'error', updatedAt: new Date().toISOString() }
            })
            invoice.value.status = ok ? 'validation_success' : 'validation_failure'
            invoice.value.meta = { ...(invoice.value.meta || {}), status: ok ? 'validated' : 'error', updatedAt: new Date().toISOString() }
        } finally { loading.validate = false }
    }
    async function postInvoice() {
        if (!invoice.value?.id) return
        loading.post = true
        try {
            const res = await $fetch<{ statusCode: string; invoiceNumber?: string; postingDate?: string }>('/api/di/postinvoicedata', {
                method: 'POST', body: { id: invoice.value.id }
            })
            if (res.statusCode === '00') {
                await invoiceRepo.update(invoice.value.id!, {
                    fbrInvoiceNumber: res.invoiceNumber,
                    meta: { ...(invoice.value.meta || {}), status: 'posted', updatedAt: res.postingDate }
                })
                invoice.value.fbrInvoiceNumber = res.invoiceNumber
                invoice.value.meta = { ...(invoice.value.meta || {}), status: 'posted', updatedAt: res.postingDate }
            }
        } finally { loading.post = false }
    }

    // load data
    onMounted(async () => {
        const idNum = Number(route.params.id)
        const data = await invoiceRepo.getFull(idNum)
        invoice.value = data || null
    })
</script>

<style>
    @media print {
        .print\:hidden {
            display: none !important;
        }

        @page {
            size: A4;
            margin: 16mm;
        }

        html,
        body {
            background: #fff;
        }
    }
</style>
