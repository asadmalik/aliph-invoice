<template>
  <div>
    <table class="min-w-full table-auto border-collapse">
      <thead>
        <tr>
          <th class="border px-2">Sr.</th>
          <th class="border px-2 text-left">HS Code</th>
          <th class="border px-2 text-left">Product</th>
          <th class="border px-2">UOM</th>
          <th class="border px-2">Qty</th>
          <th class="border px-2">Unit Rate</th>
          <th class="border px-2">Tax</th>
          <th class="border px-2">Amount</th>
          <th class="border px-2">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, idx) in rows" :key="row.id || idx">
          <td class="border px-2">{{ idx + 1 }}</td>
          <!-- HS Code -->
          <td class="border px-2">
            <UInputMenu
v-model="row.hsCode"
              :items="hsCodeOptions.map(h => ({ value: h.hsCode, label: h.itemDescription }))" placeholder="Select HS"
              class="w-36" @update:model-value="() => onFieldChange(row)" />
          </td>
          <!-- Product description -->
          <td class="border px-2">
            <UInputMenu
v-model="row.item" :items="itemNames" placeholder="Select or enter item" class="w-full"
              @update:model-value="val => onItemSelect(val, row)" />
          </td>
          <!-- UOM -->
          <td class="border px-2">
            <USelect
v-model="row.uomCode" :items="uomOptions.map(u => ({ value: u.uomCode, label: u.description }))"
              class="w-24" @update:model-value="() => onFieldChange(row)" />
          </td>
          <!-- Qty -->
          <td class="border px-2">
            <UInput
v-model.number="row.qty" type="number" class="w-16 text-right"
              @update:model-value="() => onFieldChange(row)" />
          </td>
          <!-- Rate -->
          <td class="border px-2">
            <UInput
v-model.number="row.rate" type="number" class="w-20 text-right"
              @update:model-value="() => onFieldChange(row)" />
          </td>
          <!-- Tax -->
          <td class="border px-2">
            <USelect
v-model.number="row.tax"
              :items="taxItems.map(t => ({ value: t.rate, label: `${t.name} (${t.rate}%)` }))" class="w-24"
              @update:model-value="() => onFieldChange(row)" />
          </td>
          <!-- Amount -->
          <td class="border px-2 text-right font-semibold">
            {{ row.amount.toFixed(2) }}
          </td>
          <td class="border px-2">
            <UButton color="warning" variant="soft" size="sm" @click="removeRow(idx)">Remove</UButton>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="mt-4">
      <UButton color="primary" @click="addRow">Add Row</UButton>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { useHsCodeRepo, useItemRepo, useTaxItemRepo, useUomRepo } from '@/composables/useRepos';
import type { IHsCode, IInvoiceItem, IItem, ITaxItem, IUom } from '@/DataLayer/types';
import { onMounted, ref, toRaw, watch } from 'vue';

  // Props: items array, status, scenario, saleType (for DI logic)
  const props = defineProps<{
    itemsTable: IInvoiceItem[]
    status: string
    scenario: string
    saleType: string
  }>()
  const emit = defineEmits<{
    (e: 'loaded'): void
    (e: 'item-added' | 'item-removed' | 'item-updated', rows: IInvoiceItem[]): void
  }>()

  // Local rows state
  const rows = ref<IInvoiceItem[]>([])

  // Lookup options
  const itemsOptions = ref<IItem[]>([])
  const taxItems = ref<ITaxItem[]>([])
  const hsCodeOptions = ref<IHsCode[]>([])
  const uomOptions = ref<IUom[]>([])

  // Helper: clone rows for emit
  function plainRows(): IInvoiceItem[] {
    return rows.value.map(r => ({ ...toRaw(r) }))
  }

  // Recalc row.amount and emit update
  function onFieldChange(row: IInvoiceItem) {
    const base = row.qty * row.rate
    row.amount = base - row.tax
    emit('item-updated', plainRows())
  }

  // Handle product selection
  function onItemSelect(val: string, row: IInvoiceItem) {
    const match = itemsOptions.value.find(i => i.name === val)
    if (match) {
      row.item = match.name
      row.rate = match.rate
      row.uomCode = match.uomCode
      row.hsCode = match.hsCode
    } else {
      row.item = val
    }
    onFieldChange(row)
  }

  function addRow() {
    rows.value.push({ id: Date.now(), item: '', qty: 1, rate: 0, tax: 0, amount: 0 })
    emit('item-added', plainRows())
  }

  function removeRow(idx: number) {
    rows.value.splice(idx, 1)
    emit('item-removed', plainRows())
  }

  // Expose item names for UInputMenu
  const itemNames = computed(() => itemsOptions.value.map(i => i.name))

  // Initialize look-ups and rows
  onMounted(async () => {
    rows.value = props.itemsTable.map(r => ({ ...r }))
    itemsOptions.value = await useItemRepo().getAll()
    taxItems.value = await useTaxItemRepo().getAll()
    hsCodeOptions.value = await useHsCodeRepo().getAll()
    uomOptions.value = await useUomRepo().getAll()
    emit('loaded')
  })

  // Refresh when parent array changes
  watch(() => props.itemsTable, arr => {
    rows.value = arr.map(r => ({ ...r }))
  })
</script>
