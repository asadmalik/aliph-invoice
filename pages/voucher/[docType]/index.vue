<template>
  <UContainer class="max-w-6xl py-10">
    <!-- header + New button -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold">Invoices</h1>
      <UButton to="/invoice/new" icon="i-heroicons-plus" color="primary">
        New Invoice
      </UButton>
    </div>

    <!-- global search -->
    <div class="mb-4">
      <UInput
        v-model="globalFilter"
        placeholder="Search Invoice # or Customer…"
        clearable
        leading-icon="i-lucide-search"
        class="max-w-sm"
      />
    </div>

    <!-- table with built-in filtering & sorting -->
    <UTable
      v-model:sorting="sorting"
      v-model:global-filter="globalFilter"
      :data="invoices"
      :columns="columns"
      :loading="loading"
      empty-state="No invoices yet."
      class="rounded-md shadow-sm"
    />
  </UContainer>
</template>

<script setup lang="ts">

import type { InvoiceHeader } from '@/DataLayer/types'
import type { TableColumn } from '@nuxt/ui'
import { h, onMounted, ref, resolveComponent } from 'vue'

import { UButton, UContainer, UInput, UTable } from '#components'

// — state & repos —
const loading      = ref(true)
const invoices     = ref<(InvoiceHeader & { customerName: string; invoiceTotalValue: number })[]>([])
const globalFilter = ref('')
const sorting      = ref([{ id: 'invoiceDate', desc: false }])

const invoiceRepo  = useInvoiceRepo()
const customerRepo = useCustomerRepo()
const router       = useRouter()

//const UDropdownMenu = resolveComponent('UDropdownMenu')
/*       const UButton       = resolveComponent('UButton')

      const toast = useToast() */


      // ─ badge colors ────────────────────────────────────────────────────────────────
const statusColor: Record<string,string> = {
  draft:              'warning',
  validation_success: 'success',
  validation_failure: 'error',
  error:              'error',
  validated:          'primary',
  posted:             'success'
}

// — fetch & enrich once —
onMounted(async () => {
  if (!import.meta.client) return
  loading.value = true

  const [rawInvs, customers] = await Promise.all([
    invoiceRepo.getAll(),
    customerRepo.getAll()
  ])

  const nameMap = new Map(customers.map(c => [c.id!, c.name]))
  invoices.value = rawInvs.map(inv => ({
    ...inv,
    customerName:      nameMap.get(inv.customerId) || '—',
    invoiceTotalValue: inv.invoiceTotalValue ?? inv.invoiceValue ?? 0
  }))

  loading.value = false
})

// — columns: enableSorting only where requested —
const columns = ref<TableColumn<typeof invoices.value[0]>[]>([
    // Sortable Invoice Date column with custom button header
  {
    accessorKey: 'invoiceDate',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(resolveComponent('UButton'), {
        color: 'neutral',
        variant: 'ghost',
        label: 'Invoice Date',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        // toggles between asc/desc on each click
        onClick: () => column.toggleSorting(isSorted === 'asc')
      })
    }
  },
  { accessorKey: 'invoiceNumber',  header: 'Invoice Number' },
  // Sortable Customer column
  {
    accessorKey: 'customerName',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(resolveComponent('UButton'), {
        color: 'neutral',
        variant: 'ghost',
        label: 'Customer',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(isSorted === 'asc')
      })
    }
  },
  {
    accessorKey: 'invoiceTotalValue',
    header: () => h('div', { class: 'text-right' }, 'Value'),
    cell:    ({ row }) =>
      h('div', { class: 'text-right font-medium' },
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
          .format(row.getValue('invoiceTotalValue'))
      )
  },
  {
    accessorKey: 'status',
    enableSorting: true,              // <–– you *must* explicitly opt-in again
    header: ({ column }) => {
      const s = column.getIsSorted()  // 'asc' | 'desc' | false
      return h(UButton, {
        color:   'neutral',
        variant: 'ghost',
        label:   'Status',
        icon:    s
          ? s === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(s === 'asc')
      })
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const UDropdownMenu = resolveComponent('UDropdownMenu')
      const UButton       = resolveComponent('UButton')

      return h(
        'div',
        { class: 'flex justify-end' },
        h(
          UDropdownMenu,
          {
            content: { align: 'end' },
            items:   getRowItems(row),
            'aria-label': 'Row actions'
          },
          // trigger button
          () =>
            h(UButton, {
              icon:    'i-lucide-ellipsis-vertical',
              color:   'secondary',
              variant: 'outline',
              size:    'xs',
              square:  false,
              title:   'Actions'
            })
        )
      )
    }
  }
])


// Build menu items for each row
function getRowItems(row: { original: InvoiceHeader }) {
  const id = row.original.id!

  return [
    { type: 'label', label: 'Actions' },

    // Edit
    {
      label: 'Edit Invoice',
      onSelect() {
        router.push(`/voucher/sales/edit-${id}`)
      }
    },

    // View
    {
      label: 'View Invoice',
      onSelect() {
        router.push(`/voucher/sales/${id}`)
      }
    },

    { type: 'separator' },

    // Delete
    {
      label: 'Delete Invoice',
      onSelect: async () => {
        if (!confirm('Are you sure you want to delete this invoice?')) return
        try {
          //await invoiceRepo.delete(id)
          // remove from local list (if you’re holding invoices in a ref)
          invoices.value = invoices.value.filter(i => i.id !== id)
          toast.add({ title: 'Invoice deleted', color: 'success', icon: 'i-lucide-trash' })
        } catch (err) {
          toast.add({ title: 'Failed to delete', color: 'error', icon: 'i-lucide-alert-circle' })
        }
      }
    },

    // Print
    {
      label: 'Print Invoice',
      onSelect() {
        // assuming you have a print route or view
        window.open(`/invoice/${id}/print`, '_blank')
      }
    }
  ]
}
</script>
