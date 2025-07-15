<template>
    <UContainer class="flex flex-col gap-6">

        <!-- Header: Title and Status Badge -->
        <div class="flex justify-between items-center">
            <UText tag="h1" class="text-2xl font-bold">{{ pageTitle }}</UText>
            <UBadge
:color="{
                draft: 'gray',
                validated: 'blue',
                posted: 'green',
                error: 'error'
            }[invoice.status]" class="uppercase px-3 py-1 rounded">
                {{ invoice.status }}
            </UBadge>
        </div>

        <!-- Seller & Buyer Info -->
        <div class="grid grid-cols-2 gap-8">
            <!-- Seller (read-only from Company Profile) -->
            <div class="space-y-4">
                <UFormField label="Seller Name">
                    <UInput v-model="companyProfile.businessName" readonly />
                </UFormField>
                <UFormField label="Seller Province">
                    <USelect v-model="invoice.sellerProvinceId" :items="provinceOptions" disabled />
                </UFormField>
                <UFormField label="Seller Address">
                    <UInput v-model="companyProfile.address" readonly />
                </UFormField>
                <UFormField label="Seller NTN/CNIC">
                    <UInput v-model="companyProfile.ntnCnic" readonly />
                </UFormField>
            </div>

            <!-- Buyer (select & editable) -->
            <div class="space-y-4">
                <UFormField label="Buyer Name" label-placement="bottom">
                    <CustomerSelect v-model="invoice.customerId" @select="setCustomer" />
                    <template #error>
                        <p v-if="errors.customer" class="text-red-600 text-sm">{{ errors.customer }}</p>
                    </template>
                </UFormField>
                <UFormField label="Buyer Province">
                    <USelect v-model="invoice.buyerProvinceCode" :items="provinceOptions" />
                </UFormField>
                <UFormField label="Buyer Address">
                    <UInput v-model="invoice.buyerAddress" />
                </UFormField>
                <UFormField label="Buyer NTN/CNIC">
                    <UInput v-model="invoice.buyerNtnCnic" />
                </UFormField>
                <UFormField label="Registration Type">
                    <USelect v-model="invoice.buyerRegistrationType" :items="registrationTypeOptions" />
                </UFormField>
            </div>
        </div>

        <!-- Invoice Meta (type, scenario, transaction, #, dates) -->
        <div class="flex flex-wrap gap-6 mt-4">
            <UFormField label="Invoice Type">
                <UInput :value="docTypeLabel" readonly />
            </UFormField>
            <UFormField label="Scenario">
                <USelect v-model="invoice.scenarioId" :items="scenarioOptions" @update:model-value="onScenarioChange" />
            </UFormField>
            <UFormField label="Transaction Type">
                <USelect v-model="invoice.transactionTypeId" :items="transactionTypeOptions" />
            </UFormField>
            <UFormField label="Invoice #" size="lg">
                <UInput v-model="invoice.invoiceNumber" class="w-56" />
                <template #error>
                    <p v-if="errors.invoiceNumber" class="text-red-600 text-sm">{{ errors.invoiceNumber }}</p>
                </template>
            </UFormField>
            <UFormField label="Invoice Date">
                <UInput v-model="invoice.invoiceDate" type="date" class="w-48" />
            </UFormField>
            <UFormField label="Due Date">
                <UInput v-model="invoice.dueDate" type="date" class="w-48" readonly />
            </UFormField>
            <UFormField v-if="showTerms" label="Terms">
                <USelect v-model="invoice.terms" :items="termsOptions" class="w-48" />
            </UFormField>
        </div>

        <!-- Items Table -->
        <UCard class="mt-6">
            <template #header>
                <UText tag="h2" class="text-lg font-semibold">Item Details</UText>
            </template>
            <InvoiceItemsTable
:items-table="invoice.items" :status="invoice.status" :scenario="invoice.scenarioId"
                :sale-type="invoice.saleType" @item-added="syncItems" @item-removed="syncItems"
                @item-updated="syncItems" />
            <template #footer>
                <p v-if="errors.items" class="text-red-600 text-sm">{{ errors.items }}</p>
            </template>
        </UCard>

        <!-- Discount, Shipping, Notes & Totals -->
        <div class="grid grid-cols-2 gap-8 mt-6">
            <div class="space-y-4">
                <UFormField label="Discount">
                    <UInput v-model.number="invoice.discount" type="number" />
                </UFormField>
                <UFormField label="Shipping">
                    <UInput v-model.number="invoice.shipping" type="number" />
                </UFormField>
                <UFormField label="Notes">
                    <UTextarea v-model="invoice.notes" :notes="3" />
                </UFormField>
            </div>
            <div class="self-end w-80 space-y-1 text-sm">
                <div class="flex justify-between"><span>Sub-Total:</span><span>{{ fmt(subTotal) }}</span></div>
                <div class="flex justify-between"><span>Tax:</span><span>{{ fmt(totalTax) }}</span></div>
                <div class="flex justify-between"><span>Extra Tax:</span><span>{{ fmt(totalExtraTax) }}</span></div>
                <div class="flex justify-between"><span>Discount:</span><span>-{{ fmt(invoice.discount) }}</span></div>
                <div class="flex justify-between"><span>Shipping:</span><span>{{ fmt(invoice.shipping) }}</span></div>
                <div class="border-t pt-1 flex justify-between font-semibold text-lg">
                    <span>Grand Total:</span><span>{{ fmt(grandTotal) }}</span>
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 self-end mt-8">
            <UButton
v-if="invoice.status === 'draft'" color="primary" :loading="isSaving" :disabled="!isValid"
                @click="saveInvoice">Save</UButton>
            <UButton v-if="invoice.status === 'draft'" color="gray" :disabled="!isValid" @click="validateInvoice">
                Validate
            </UButton>
            <UButton v-if="invoice.status === 'validated'" color="primary" :loading="isPosting" @click="postInvoice">
                Submit to
                FBR</UButton>
            <UButton v-if="invoice.status === 'posted'" color="secondary" @click="printInvoice">Print Tax Invoice
            </UButton>
        </div>

    </UContainer>
</template>
<script setup lang="ts">
    import type { ICustomer, IInvoiceItem } from '@/DataLayer/types'
import { useCustomerRepo, useInvoiceRepo, useProvinceRepo, useTransactionTypeRepo } from '@/composables/useRepos'
import CustomerSelect from '~/components/ui/CustomerSelect.vue'
import InvoiceItemsTable from '~/components/ui/InvoiceItemsTable.vue'
    interface SelectOption<V = string> {
        label: string
        value: V
        icon?: string
    }

    const companyProfile = {
        businessName: 'Aliph Technologies',
        sellerProvinceCode: '01', // Default to Punjab
        address: 'COMPANY ADDRESS HERE',
        ntnCnic: '12345-6789012-3' // Example NTN/CNIC
    }

    // — Page Title & Meta —
    const pageTitle = computed(() => {
        const docType = useRoute().params.docType as 'sale' | 'purchase' | 'credit' || 'sale'
        return docType === 'credit' ? 'Credit Note' : `${docType.charAt(0).toUpperCase() + docType.slice(1)} Invoice`
    })





    // — Route & Doc-Type Mapping (Nuxt auto-imports useRoute) —
    const docType = useRoute().params.docType as 'sale' | 'purchase' | 'credit' || 'sale'
    const docTypeMap = {
        sale: { label: 'Sale Invoice', documentTypeId: 4, defaultTransType: 1 },
        purchase: { label: 'Purchase Invoice', documentTypeId: 5, defaultTransType: 1 },
        credit: { label: 'Credit Note', documentTypeId: 12, defaultTransType: 3 }
    }
    const { label: docTypeLabel, documentTypeId, defaultTransType } = docTypeMap[docType]

    // — Repositories & Lookups —
    const invoiceRepo = useInvoiceRepo()
    const customerRepo = useCustomerRepo()
    const provinceRepo = useProvinceRepo()
    const transTypeRepo = useTransactionTypeRepo()


    const customerOptions = ref<ICustomer[]>([])

    // — Static option arrays —
    const scenarioOptions = [
        { label: 'SNO01 — Local Taxable', value: 'SNO01', saleType: 'Goods at Standard Rate' },
        { label: 'SNO17 — Export Zero-Rated', value: 'SNO17', saleType: 'Export of Goods' },
        // …etc
    ]
    const registrationTypeOptions = [
        { label: 'Registered', value: 'Registered' },
        { label: 'Un-Registered', value: 'Un-Registered' }
    ]
    const termsOptions = [
        { label: 'Due On Receipt', value: 'Due On Receipt' },
        { label: 'Net 15', value: 'Net 15' },
        { label: 'Net 30', value: 'Net 30' }
    ]

    // — Core invoice state —
    const invoice = reactive({
        id: undefined,
        customerId: 0,
        customerName: '',
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        terms: 'Due On Receipt',
        billTo: '',
        currencyCode: 'PKR',
        buyerAddress: '',
        buyerNtnCnic: '',
        buyerRegistrationType: registrationTypeOptions[0].value,
        documentTypeId,
        transactionTypeId: defaultTransType,
        scenarioId: scenarioOptions[0].value,
        saleType: scenarioOptions[0].saleType,
        sellerProvinceId: '01', // Default to Punjab
        sellerBusinessName: companyProfile.businessName,
        sellerAddress: companyProfile.address,
        buyerProvinceCode: '',
        status: 'draft',
        items: [] as IInvoiceItem[],
        discount: 0,
        shipping: 0,
        notes: ''
    })

    // — Errors & loading flags —
    const errors = reactive({ customer: null, invoiceNumber: null, items: null, form: null })
    const isSaving = ref(false)
    const isPosting = ref(false)

    // — Computed props & totals —
    const showTerms = computed(() => docType !== 'credit')
    const subTotal = computed(() => invoice.items.reduce((s, r) => s + r.qty * r.rate, 0))
    const totalTax = computed(() => invoice.items.reduce((s, r) => s + (r.tax || 0), 0))
    const totalExtraTax = computed(() =>
        invoice.items.reduce((s, r) => s + ((r.extraTax || 0) + (r.furtherTax || 0) + (r.fedPayable || 0)), 0)
    )
    const grandTotal = computed(() =>
        subTotal.value + totalTax.value + totalExtraTax.value - (invoice.discount || 0) + (invoice.shipping || 0)
    )
    const fmt = (n: number) => n.toFixed(2)

    const provinceOptions = ref<SelectOption<string>[]>([])
    const transactionTypeOptions = ref<SelectOption<number>[]>([])


    // — Init look-ups & seed data —
    onMounted(async () => {
        await nextTick();

        const provinces = await provinceRepo.getAll()
        //console.log('🌍 Provinces loaded:', provinceOptions.value);
        const transactionTypes = await transTypeRepo.getAll()
        customerOptions.value = await customerRepo.getAll()
        invoice.sellerProvinceId = '01' // Default to Punjab


        provinceOptions.value = provinces.map((p): SelectOption<string> => ({
            label: p.provinceName,
            value: p.provinceId
        }))

        transactionTypeOptions.value = transactionTypes.map((t): SelectOption<number> => ({
            label: t.transaction_DESC,
            value: t.transaction_TYPE_ID
        }))
        await resetInvoice()
    })

    // — Handlers —

    // When user picks a customer, fill all buyer fields
    function setCustomer(c: ICustomer) {
        invoice.customerId = c.id!
        invoice.customerName = c.name
        invoice.buyerAddress = c.address || ''
        invoice.buyerNtnCnic = c.ntnCnic || ''
        invoice.buyerProvinceCode = c.provinceCode || ''
        // registration type: if NTN exists ⇒ Registered
        invoice.buyerRegistrationType = c.ntnCnic ? 'Registered' : 'Un-Registered'
        errors.customer = null
    }

    // Scenario change → update saleType & reset transactionTypeId
    function onScenarioChange(scn: string) {
        const s = scenarioOptions.find(x => x.value === scn)!
        invoice.saleType = s.saleType
        invoice.transactionTypeId = defaultTransType
    }

    // Sync items from child table
    function syncItems(rows: IInvoiceItem[]) {
        invoice.items = rows
    }

    // Auto-set due date when date or terms change
    watch(
        () => [invoice.invoiceDate, invoice.terms],
        ([d, t]) => {
            if (!d) return invoice.dueDate = ''
            const dt = new Date(d)
            const m = t.match(/Net\s+(\d+)/)
            dt.setDate(dt.getDate() + (m ? +m[1] : 0))
            invoice.dueDate = dt.toISOString().split('T')[0]
        },
        { immediate: true }
    )

    // Validation helpers
    const isValid = computed(() =>
        invoice.customerId > 0 &&
        invoice.invoiceNumber.trim() !== '' &&
        invoice.items.length > 0 &&
        invoice.items.every(it => it.item.trim() && it.qty > 0 && it.rate >= 0 && !!it.hsCode && !!it.uomCode)
    )
    function validateForm() {
        errors.customer = invoice.customerId > 0 ? null : 'Please select a buyer.'
        errors.invoiceNumber = invoice.invoiceNumber.trim() ? null : 'Invoice number is required.'
        errors.items = invoice.items.length ? null : 'At least one line item is required.'
        return !errors.customer && !errors.invoiceNumber && !errors.items
    }

    // Actions: reset, save, validate, post, print
    async function resetInvoice() {
        errors.form = null
        try {
            const nextNum = await invoiceRepo.getNextNumber()
            invoice.invoiceNumber = nextNum
            invoice.items = []
            invoice.customerId = 0
            invoice.buyerAddress = ''
            invoice.buyerNtnCnic = ''
            invoice.buyerRegistrationType = registrationTypeOptions[0].value
            invoice.status = 'draft'
            console.log('🔄 Invoice reset, next #:', nextNum)
        } catch (e: any) {
            console.error(e)
            errors.form = 'Failed to initialize invoice.'
        }
    }

    async function saveInvoice() {
        if (!validateForm()) return
        isSaving.value = true
        try {
            const id = await invoiceRepo.addWithItems(toRaw(invoice))
            console.log('💾 Draft saved, ID:', id)
            await resetInvoice()
        } catch (e: any) {
            console.error(e)
            errors.form = 'Save failed.'
        } finally { isSaving.value = false }
    }

    async function validateInvoice() {
        if (!validateForm()) return
        try {
            await invoiceRepo.update(invoice.id!, { status: 'validated' })
            invoice.status = 'validated'
            console.log('✅ Invoice marked VALIDATED')
        } catch (e: any) {
            console.error(e)
            errors.form = 'Validation error.'
        }
    }

    async function postInvoice() {
        if (invoice.status !== 'validated') return
        isPosting.value = true
        try {
            await invoiceRepo.validateAndPost(invoice.id!)
            const updated = await invoiceRepo.get(invoice.id!)
            invoice.status = updated?.status!
            invoice.fbrInvoiceNumber = updated?.fbrInvoiceNumber
            console.log('🚀 Posted to FBR, number:', invoice.fbrInvoiceNumber)
        } catch (e: any) {
            console.error(e)
            invoice.status = 'error'
            errors.form = e.message
        } finally { isPosting.value = false }
    }

    function printInvoice() {
        window.print()
    }
</script>
