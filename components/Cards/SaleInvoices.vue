<template>
    <UCard
:ui="{
        root: 'hover:shadow-lg transition flex flex-col gap-4 justify-between shadow-lg hover:shadow-xl',
        header: 'flex items-center gap-2',
        footer: 'flex justify-between'
    }">
        <template #header>
            <UIcon name="i-heroicons-document-text" class="h-8 w-8 text-primary" />
            <h1 class="text-lg font-semibold">
                Sales Invoices ({{ invoices.length }})
            </h1>
        </template>

        <div class="flex flex-col gap-2.5 flex-auto grow">
            <div>Search Invoices</div>
            <USelectMenu
v-model="selectedInvoice" :items="invoiceOptions" placeholder="Search or Select Invoice"
                class="w-full" size="lg">

                <template #default="{ modelValue }">
                    <div v-if="modelValue" class="flex items-center justify-between">
                        <div class="flex flex-col">
                            <span class="font-semibold">{{ modelValue.invoiceNumber }}</span>
                            <span class="text-xs text-gray-500">
                                {{ new Date(modelValue.invoiceDate).toLocaleDateString() }}
                            </span>
                            <span class="text-sm text-gray-600">{{ modelValue.customerName }}</span>
                        </div>
                        <UBadge variant="subtle" color="primary" class="px-2 py-1 text-sm">
                            {{ formatCurrency(modelValue.invoiceTotalValue) }}
                        </UBadge>
                    </div>
                    <span v-else class="text-gray-400">Search or select an invoice</span>
                </template>

                <template #item="{ item, isHighlighted, isSelected }">
  <div
    class="flex flex-col px-4 py-3 rounded-lg cursor-pointer transition w-full"
    :class="{
      'bg-primary/10': isHighlighted,
      'bg-primary/20 ring-1 ring-primary': isSelected
    }"
  >
    <!-- Top row: Invoice #, Status badge and Amount -->
    <div class="flex justify-between items-center mb-1">
      <div class="flex items-center space-x-2">
        <span class="font-semibold text-sm">{{ item.invoiceNumber }}</span>
        <UBadge
          variant="subtle"
          size="xs"
          :color="verifyColor[item.validation?.lastStatus] || 'neutral'"
          class="text-xs uppercase"
        >
          {{ item.validation?.lastStatus?.replace(/_/g, ' ') }}
        </UBadge>
      </div>
      <span class="text-sm font-medium text-right text-primary">
        {{ formatCurrency(item.invoiceTotalValue) }}
      </span>
    </div>

    <!-- Bottom row: Date and Customer -->
    <div class="flex justify-between items-center text-xs text-gray-500">
      <span>{{ new Date(item.invoiceDate).toLocaleDateString() }}</span>
      <span class="truncate max-w-[6rem] text-gray-700">{{ item.customerName }}</span>
    </div>
  </div>
</template>

                <template #empty="{ searchTerm }">
                    <div class="px-3 py-2 text-gray-500">
                        No invoices match “<strong>{{ searchTerm }}</strong>”
                    </div>
                </template>
            </USelectMenu>

            <div v-if="selectedInvoice" class="flex items-center gap-2">
                <UButton size="sm" color="info" :href="`/voucher/sale/${selectedInvoice.id}`" icon="lucide:eye">
                    View
                </UButton>
                <UButton
size="sm" color="warning" :href="`/voucher/sale/${selectedInvoice.id}/edit`"
                    icon="lucide:pencil-line">
                    Edit
                </UButton>
            </div>
        </div>

        <template #footer>
            <UButton to="/voucher/sale" color="primary" icon="i-heroicons-document-text">
                View All
            </UButton>
            <UButton to="/voucher/sale/new" color="primary" icon="i-heroicons-plus">
                Add New
            </UButton>
        </template>
    </UCard>
</template>

<script setup lang="ts">


    import type { InvoiceHeader } from '@/DataLayer/types';

    const invoiceRepo = useInvoiceRepo()
    const customerRepo = useCustomerRepo()
const verifyColor: Record<string,string> = {
  draft:              'warning',
  validation_success: 'success',
  validation_failure: 'error',
  posted:             'success'
}
    // raw & enriched invoice list
    const invoices = ref<(InvoiceHeader & { customerName: string; invoiceTotalValue: number })[]>([])

    // the selected invoice object
    const selectedInvoice = ref<typeof invoices.value[0] | null>(null)

    // fetch & enrich
    onMounted(async () => {
        const [rawInvs, customers] = await Promise.all([
            invoiceRepo.getAll(),
            customerRepo.getAll()
        ])
        const nameMap = new Map(customers.map(c => [c.id!, c.name]))
        invoices.value = rawInvs.map(inv => ({
            ...inv,
            customerName: nameMap.get(inv.customerId) || '—',
            invoiceTotalValue: inv.invoiceTotalValue ?? inv.invoiceValue ?? 0
        }))
    })

    // build SelectMenu options with a `label` field
    const invoiceOptions = computed(() =>
        invoices.value.map(inv => ({
            // `label` is what USelectMenu shows
            label: `${inv.invoiceNumber} — ${inv.customerName} — ${new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'PKR'
            }).format(inv.invoiceTotalValue)
                }`,
            // keep all the original props so v-model still gives you the full object
            ...inv
        }))
    )

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PKR'
        }).format(amount)
    }
</script>
