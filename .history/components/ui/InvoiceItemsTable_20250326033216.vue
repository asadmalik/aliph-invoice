<template>
    <UTable :data="localItems" :columns="columns" class="mb-4" />
  </template>
  
  <script setup lang="ts">
  import { UButton, UInput, USelect } from '#components'
import type { TableColumn } from '@nuxt/ui'
import { computed, h, ref, watch } from 'vue'
  
  interface InvoiceItem {
    item: string
    quantity: number
    rate: number
    tax: number | string
  }
  
  // Props: invoice items, tax options, and a mode ("edit" | "view")
  const props = defineProps<{
    items: InvoiceItem[]
    taxOptions: Array<{ label: string; value: number | string }>
    mode?: 'edit' | 'view'
  }>()
  
  // Emit event to update items in parent
  const emit = defineEmits<{
    (e: 'update:items', items: InvoiceItem[]): void
  }>()
  
  // Default mode is "edit" if not specified
  const mode = computed(() => props.mode ?? 'edit')
  
  // Create a local reactive copy of items so we can track changes
  const localItems = ref<InvoiceItem[]>([...props.items])
  watch(
    localItems,
    (newItems) => {
      emit('update:items', newItems)
    },
    { deep: true }
  )
  
  // Helper: calculate row amount (quantity * rate)
  function rowAmount(item: InvoiceItem): number {
    return (Number(item.quantity) || 0) * (Number(item.rate) || 0)
  }
  
  // Helper: format a currency value (adjust as needed)
  function formatCurrency(value: number): string {
    // For production you might want to use Intl.NumberFormat
    return '$' + Number(value).toFixed(2)
  }
  
  // Helper: in view mode, get tax option label
  function getTaxLabel(value: number | string): string {
    const option = props.taxOptions.find((opt) => opt.value === value)
    return option ? option.label : String(value)
  }
  
  // Columns definition for UTable
  const columns: TableColumn<InvoiceItem>[] = [
    {
      accessorKey: 'item',
      header: 'Item',
      cell: ({ row }) => {
        if (mode.value === 'edit') {
          return h(UInput, {
            modelValue: row.original.item,
            'onUpdate:modelValue': (val: string) => (row.original.item = val),
            placeholder: 'Type or select an item'
          })
        } else {
          return h('span', row.original.item || '')
        }
      }
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => {
        if (mode.value === 'edit') {
          return h(UInput, {
            type: 'number',
            modelValue: row.original.quantity,
            'onUpdate:modelValue': (val: number) => (row.original.quantity = val),
            min: 0
          })
        } else {
          return h('span', String(row.original.quantity))
        }
      }
    },
    {
      accessorKey: 'rate',
      header: 'Rate',
      cell: ({ row }) => {
        if (mode.value === 'edit') {
          return h(UInput, {
            type: 'number',
            modelValue: row.original.rate,
            'onUpdate:modelValue': (val: number) => (row.original.rate = val),
            min: 0
          })
        } else {
          return h('span', String(row.original.rate))
        }
      }
    },
    {
      accessorKey: 'tax',
      header: 'Tax',
      cell: ({ row }) => {
        if (mode.value === 'edit') {
          return h(USelect, {
            modelValue: row.original.tax,
            'onUpdate:modelValue': (val: number | string) => {
              row.original.tax = val
              handleTaxChange(row.original)
            },
            items: props.taxOptions
          })
        } else {
          return h('span', getTaxLabel(row.original.tax))
        }
      }
    },
    {
      accessorKey: 'amount',
      header: () => h('div', { class: 'text-right' }, 'Amount'),
      cell: ({ row }) => {
        return h('div', { class: 'text-right font-medium' }, formatCurrency(rowAmount(row.original)))
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row, index }) => {
        if (mode.value === 'edit') {
          return h(
            'div',
            { class: 'text-right' },
            h(UButton, {
              type: 'error',
              size: 'small',
              onClick: () => removeRow(index)
            }, 'X')
          )
        } else {
          return h('div') // no actions in view mode
        }
      }
    }
  ]
  
  // Handle tax change: if "New Tax" is selected, prompt for a custom rate
  function handleTaxChange(item: InvoiceItem) {
    if (item.tax === 'new') {
      const newTax = prompt("Enter new tax rate (0-99):")
      if (newTax !== null) {
        const parsed = parseInt(newTax)
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 99) {
          // Optionally, update parent's tax options here if needed
          item.tax = parsed
        } else {
          alert("Invalid tax rate.")
          item.tax = 0
        }
      } else {
        item.tax = 0
      }
    }
  }
  
  // Remove a row from the local items
  function removeRow(index: number) {
    localItems.value.splice(index, 1)
  }
  </script>
  