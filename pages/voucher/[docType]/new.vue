<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
    <UContainer class="flex flex-col gap-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <UText tag="h1" class="text-4xl font-extrabold uppercase text-gray-400">{{ pageTitle }} # {{ nextInvoiceNumber }}</UText>
            <UBadge
:color="{
                draft: 'neutral',
                validated: 'primary',
                posted: 'success',
                error: 'error',
            }[invoice.meta.status]" class="uppercase px-3 py-1 rounded">
                {{ invoice.meta.status }}
            </UBadge>
        </div>

        <!-- Buyer Info -->
        <div class="grid grid-cols-2 gap-8">
            <div class="space-y-2">
                <UFormField label="Buyer Name" label-placement="bottom" :error="errors.customer">
                    <CustomerSelect v-model="invoice.customerId" @select="setCustomer" />
                </UFormField>
            </div>
        </div>

        <!-- Invoice Meta -->
        <div class="flex flex-wrap gap-6 mt-4">
            <div class="hidden">
                <UFormField label="Invoice Type" hidden>
                    <UInput :value="docTypeLabel" readonly />
                </UFormField>
                <UFormField label="Scenario" hidden>
                    <USelect
v-model="invoice.scenarioId" :items="scenarioOptions"
                        @update:model-value="onScenarioChange" />
                </UFormField>
                <UFormField label="Transaction Type" hidden>
                    <USelect v-model="invoice.transactionTypeId" :items="transactionTypeOptions" />
                </UFormField>
            </div>
            <div class="flex flex-row gap-6">
                <UFormField label="Invoice Date">
                    <UInput v-model="invoice.invoiceDate" type="date" class="w-44" />
                </UFormField>
                <UFormField label="Due Date">
                    <UInput v-model="invoice.meta.dueDate" type="date" class="w-44" readonly />
                </UFormField>
                <UFormField v-if="showTerms" label="Terms">
                    <USelect v-model="invoice.meta.terms" :items="termsOptions" class="w-44" />
                </UFormField>
            </div>
        </div>

        <!-- Items Table -->
        <UCard
class="mt-6" :ui="{
            root: 'sm:py-0 ',      // remove padding from the outer wrapper 
            body: 'sm:p-0 p-0',      // remove padding from the body container 
            footer: 'p-0'      // (if you need) remove padding from a footer slot 
        }">
            <template #header>
                <UText tag="h2" class="text-lg font-semibold">Item Details</UText>
            </template>
            <InvoiceItemsTable
:items-table="invoice.items" :status="invoice.meta.status" :scenario="invoice.scenarioId"
                :sale-type="invoice.meta.saleType" @item-added="syncItems" @item-removed="syncItems"
                @item-updated="syncItems" />
            <template #footer>
                <p v-if="errors.items" class="text-red-600 text-sm">
                    {{ errors.items }}
                </p>
            </template>
        </UCard>

        <!-- Totals & Extras Wrapper -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 mt-6">
            <!-- Left: Inputs -->
            <UCard flat class="p-4">
                <template #header>
                    <h3 class="text-lg font-semibold">Extras &amp; Notes</h3>
                </template>

                <!-- Discount & Shipping row -->
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <UFormField label="Header Discount" label-placement="top">
                        <UInput v-model.number="invoice.discount" type="number" placeholder="0.00" class="w-full" />
                    </UFormField>

                    <UFormField label="Shipping" label-placement="top">
                        <UInput v-model.number="invoice.shipping" type="number" placeholder="0.00" class="w-full" />
                    </UFormField>
                </div>

                <!-- Notes (full width, taller) -->
                <UFormField label="Notes" label-placement="top">
                    <UTextarea
v-model="invoice.meta.notes" rows="5" placeholder="Any special instructions…"
                        class="w-full" />
                </UFormField>
            </UCard>

            <!-- Right: Summary Card -->
            <UCard class="relative overflow-hidden">
                <!-- Header Bar -->
                <div class="bg-primary/10 px-4 py-3">
                    <h3 class="text-lg font-semibold text-primary">Invoice Summary</h3>
                </div>

                <div class="p-4 space-y-2 text-sm">
                    <!-- Detail Rows -->
                    <div v-for="(row, i) in summaryRows" :key="i" class="grid grid-cols-2 items-center">
                        <span class="text-gray-600">{{ row.label }}</span>
                        <span :class="['text-right', row.isNegative ? 'text-red-600' : 'text-gray-800']">
                            {{ row.sign }}{{ fmt(row.value) }}
                        </span>
                    </div>

                    <!-- Divider -->
                    <UDivider class="my-2" />

                    <!-- Grand Total -->
                    <div class="grid grid-cols-2 items-center font-semibold text-lg">
                        <span class="text-gray-800">Grand Total</span>
                        <span class="text-right text-primary">{{ fmt(grandTotal) }}</span>
                    </div>
                </div>
            </UCard>
        </div>

        <!-- Actions -->
        <div class="flex justify-end mt-8">
            <UButton color="primary" :disabled="!isValid" :loading="isSaving" @click="saveDraft">
                Save Draft
            </UButton>
        </div>
    </UContainer>
</template>

<script setup lang="ts">
    import type {
    ICustomer,
    IInvoice,
    IInvoiceItem,
    InvoiceStatus,
} from '@/DataLayer/types';
import {
    useCustomerRepo,
    useInvoiceRepo,
    useTransactionTypeRepo,
} from '@/composables/useRepos';
import CustomerSelect from '~/components/ui/CustomerSelect.vue';
import InvoiceItemsTable from '~/components/ui/InvoiceItemsTable.vue';

    // — Page Meta & Title —
    const pageTitle = computed(() => {
        const dt =
            (useRoute().params.docType as
                | 'sale'
                | 'purchase'
                | 'credit') || 'sale';
        return dt === 'credit'
            ? 'Credit Note'
            : `${dt.charAt(0).toUpperCase() + dt.slice(1)} Invoice`;
    });
    definePageMeta({ layout: 'default', title: 'New Invoice' });
    useHead({ title: 'New ' + pageTitle.value });
    useSeoMeta({
        title: 'New ' + pageTitle.value,
        description: 'Create a new invoice draft.',
    });

    // — Doc-Type Mapping —
    const docType =
        (useRoute().params.docType as 'sale' | 'purchase' | 'credit') ||
        'sale';
    const docTypeMap = {
        sale: { label: 'Sale Invoice', defaultTransType: 1 },
        purchase: { label: 'Purchase Invoice', defaultTransType: 1 },
        credit: { label: 'Credit Note', defaultTransType: 3 },
    };
    const docTypeLabel = docTypeMap[docType].label;
    const defaultTransType = docTypeMap[docType].defaultTransType;

    // — Repos & Lookups —
    const invoiceRepo = useInvoiceRepo();
    const customerRepo = useCustomerRepo();
    const transTypeRepo = useTransactionTypeRepo();

    const nextInvoiceNumber = ref<string>('');



    const scenarioOptions = [
        {
            label: 'SNO01 — Local Taxable',
            value: 'SNO01',
            saleType: 'Goods at Standard Rate',
        },
        {
            label: 'SNO17 — Export Zero-Rated',
            value: 'SNO17',
            saleType: 'Export of Goods',
        },
    ];
    const termsOptions = [
        { label: 'Due On Receipt', value: 'Due On Receipt' },
        { label: 'Net 15', value: 'Net 15' },
        { label: 'Net 30', value: 'Net 30' },
    ];

    const transactionTypeOptions = ref<
        { label: string; value: number }[]
    >([]);
    const customerOptions = ref<ICustomer[]>([]);

    // — Helpers —
    function todayString(): string {
        return new Date().toISOString().split('T')[0];
    }
    function formatDateDMY(dateIso: string): string {
        const [y, m, d] = dateIso.split('-');
        return `${d}/${m}/${y}`;
    }

    // — Reactive Invoice State —
    const initialIso = todayString();
    const invoice = reactive<IInvoice>({
        id: undefined,
        invoiceNumber: '',
        customerId: 0,
        invoiceDate: initialIso,

        items: [] as IInvoiceItem[],
        discount: 0,
        shipping: 0,
        invoiceTotalValue: 0,
        fbrInvoiceNumber: undefined,

        scenarioId: scenarioOptions[0].value,
        transactionTypeId: defaultTransType,

        validation: {
            attempts: [],
            lastStatus: 'draft' as InvoiceStatus,
        },

        meta: {
            dueDate: initialIso,
            currencyCode: 'PKR',
            saleType: scenarioOptions[0].saleType,
            status: 'draft',
            notes: '',
            termsAndConditions: '',
            terms: termsOptions[0].value,
            createdAt: formatDateDMY(initialIso),
            createdBy: 'system',
            updatedAt: undefined,
            updatedBy: undefined,
        },
    });

    // — Errors & Loading —
    const errors: any = reactive({
        customer: null,
        items: null,
        form: null,
    });
    const isSaving = ref(false);

    // — Computed Totals —
    const subTotal = computed(() =>
        invoice.items?.reduce(
            (sum, r) => sum + (r.valueSalesExcludingST ?? r.quantity * r.rate),
            0
        )
    );
    const totalSalesTax = computed(() =>
        invoice.items?.reduce(
            (sum, r) => sum + (r.salesTaxApplicable ?? 0),
            0
        )
    );
    const totalWithheldTax = computed(() =>
        invoice.items?.reduce(
            (sum, r) => sum + (r.salesTaxWithheldAtSource ?? 0),
            0
        )
    );
    const totalExtraTax = computed(() =>
        invoice.items?.reduce(
            (sum, r) =>
                sum +
                (r.extraTax ?? 0) +
                (r.furtherTax ?? 0) +
                (r.fedPayable ?? 0),
            0
        )
    );
    const totalLineDiscount = computed(() =>
        invoice.items?.reduce(
            (sum, r) => sum + (r.lineDiscount ?? 0),
            0
        )
    );
    const grandTotal = computed(() => {
        const st = subTotal.value ?? 0;
        const tax = totalSalesTax.value ?? 0;
        const ext = totalExtraTax.value ?? 0;
        const wht = totalWithheldTax.value ?? 0;
        const ld = totalLineDiscount.value ?? 0;
        const hd = invoice.discount ?? 0;
        const sh = invoice.shipping ?? 0;

        return st + tax + ext - wht - ld - hd + sh;
    });
    const fmt = (n: number) => n.toFixed(2);

    // — UI Logic —

    const summaryRows = computed(() => [
        { label: 'Sub-Total', value: subTotal.value, sign: '', isNegative: false },
        { label: 'Sales Tax', value: totalSalesTax.value, sign: '', isNegative: false },
        { label: 'Withheld Tax', value: totalWithheldTax.value, sign: '-', isNegative: true },
        { label: 'Extra Tax', value: totalExtraTax.value, sign: '', isNegative: false },
        { label: 'Line Discounts', value: totalLineDiscount.value, sign: '-', isNegative: true },
        { label: 'Header Discount', value: invoice.discount, sign: '-', isNegative: true },
        { label: 'Shipping', value: invoice.shipping, sign: '', isNegative: false },
    ]);

    const showTerms = computed(() => docType !== 'credit');
    const isValid = computed(
        () => invoice.customerId > 0 && invoice.items?.length > 0
    );

    onMounted(async () => {
        await nextTick();
        const [txTypes, customers] = await Promise.all([
            transTypeRepo.getAll(),
            customerRepo.getAll(),
        ]);
        transactionTypeOptions.value = txTypes.map((t) => ({
            label: t.transaction_DESC,
            value: t.transaction_TYPE_ID,
        }));
        customerOptions.value = customers;
        nextInvoiceNumber.value =
            await invoiceRepo.getNextNumber();
    });

    // — Handlers —
    function setCustomer(c: ICustomer) {
        invoice.customerId = c.id!;
        errors.customer = null;
    }

    function onScenarioChange(scn: string) {
        const s = scenarioOptions.find((x) => x.value === scn)!;
        invoice.meta.saleType = s.saleType;
        invoice.transactionTypeId = defaultTransType;
    }

    function syncItems(rows: IInvoiceItem[]) {
        invoice.items = rows;
    }

    watch(
        [() => invoice.invoiceDate, () => invoice.meta.terms] as const,
        ([date, terms]) => {
            if (!date) {
                invoice.meta.dueDate = '';
                return;
            }
            const dt = new Date(date);
            const m = terms.match(/Net\s+(\d+)/i);
            if (m) dt.setDate(dt.getDate() + parseInt(m[1], 10));
            invoice.meta.dueDate = dt.toISOString().split('T')[0];
        },
        { immediate: true }
    );

    function validateForm() {
        errors.customer =
            invoice.customerId > 0
                ? null
                : 'Please select a buyer.';
        errors.items =
            invoice.items && invoice.items.length > 0
                ? null
                : 'At least one line item is required.';
        return !errors.customer && !errors.items;
    }

    async function saveDraft() {
        if (!validateForm()) return;
        isSaving.value = true;
        try {
            if (!invoice.id) {
                invoice.invoiceNumber =
                    await invoiceRepo.getNextNumber();
            }
            invoice.invoiceTotalValue = grandTotal.value;
            const iso = todayString();
            invoice.meta.updatedAt = formatDateDMY(iso);
            invoice.meta.updatedBy = 'system';
            const id = await invoiceRepo.saveDraft(invoice);
            invoice.id = id;
            console.log('Draft saved with ID:', id);


            resetInvoice();
        } catch (err: any) {
            console.error('Error saving draft:', err);
            errors.form = err.message;
        } finally {
            isSaving.value = false;
        }
    }

    async function resetInvoice() {
        invoice.id = undefined;
        invoice.invoiceNumber = await invoiceRepo.getNextNumber();
        invoice.invoiceDate = initialIso;
        invoice.items = [];
        invoice.discount = 0;
        invoice.shipping = 0;
        invoice.invoiceTotalValue = 0;
        invoice.fbrInvoiceNumber = undefined;

        invoice.scenarioId = scenarioOptions[0].value;
        invoice.transactionTypeId = defaultTransType;

        invoice.validation = {
            attempts: [],
            lastStatus: 'draft',
        };

        invoice.meta = {
            dueDate: initialIso,
            currencyCode: 'PKR',
            saleType: scenarioOptions[0].saleType,
            status: 'draft',
            notes: '',
            termsAndConditions: '',
            terms: termsOptions[0].value,
            createdAt: formatDateDMY(initialIso),
            createdBy: 'system',
            updatedAt: undefined,
            updatedBy: undefined,
        };
    }
</script>
