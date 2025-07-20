<template>
  <div>
    <table class="min-w-full table-auto border-collapse">
      <thead>
        <tr>
          <th class="border px-2">Sr.</th>
          <th class="border px-2 text-left">Product (HS &mdash; Name)</th>
          <th class="border px-2">UOM</th>
          <th class="border px-2">Qty</th>
          <th class="border px-2 text-right">Unit Rate</th>
          <th class="border px-2 text-right">Tax Rate (%)</th>
          <th class="border px-2 text-right">Amount</th>
          <th class="border px-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, idx) in rows" :key="idx">
          <td class="border px-2">{{ idx + 1 }}</td>

          <!-- HS Code & Name -->
          <td class="border px-2">
            <UInputMenu
            v-model="row.item"
              :items="itemsOptions.map(i => ({ value: i.hsCode!, label: `${i.hsCode} — ${i.name}` }))"
              placeholder="Search by code or name" class="w-full"
              @update:model-value="selection => onItemSelect(selection.value, row)" />
          </td>

          <!-- UOM (read-only) -->
          <td class="border px-2">
            <span>{{ row.uomCode }}</span>
          </td>

          <!-- Quantity -->
          <td class="border px-2">
            <UInput
v-model.number="row.qty" type="number" min="0" class="w-16 text-right"
              @update:model-value="() => onFieldChange(row)" />
          </td>

          <!-- Rate (read-only) -->
          <td class="border px-2 text-right">
            <span>{{ row.rate.toFixed(2) }}</span>
          </td>

          <!-- Tax Rate -->
          <td class="border px-2 text-right">
            <span>{{ row.salesTaxRate?.toFixed(2) }}</span>
          </td>

          <!-- Amount -->
          <td class="border px-2 text-right font-semibold">
            <span>{{ row.totalValues?.toFixed(2) }}</span>
          </td>

          <!-- Actions -->
          <td class="border px-2 flex space-x-1">
            <UButton size="sm" @click="toggleDetails(idx)">Details</UButton>
            <UButton color="warning" variant="soft" size="sm" @click="removeRow(idx)">Remove</UButton>
          </td>
        </tr>

        <!-- Details Row -->
         <!-- eslint-disable-next-line vue/no-use-v-if-with-v-for -->
        <tr v-for="(row, idx) in rows"  :key="'details-' + idx">
          <td v-if="detailsOpen[idx]" colspan="8" class="border px-2 bg-gray-50">
            <div class="grid grid-cols-4 gap-4 p-2">
              

              <div>
                <label class="block text-sm font-medium">Sales Tax Amt</label>
                <span>{{ row.salesTaxApplicable?.toFixed(2) }}</span>
              </div>

              <div>
                <label class="block text-sm font-medium">Withheld Tax</label>
                <UInput
v-model.number="row.salesTaxWithheldAtSource" type="number" class="w-full text-right"
                  @update:model-value="() => onFieldChange(row)" />
              </div>

              <div>
                <label class="block text-sm font-medium">Discount</label>
                <UInput
v-model.number="row.lineDiscount" type="number" class="w-full text-right"
                  @update:model-value="() => onFieldChange(row)" />
              </div>
            </div>
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
  import { useItemRepo, useUomRepo } from '@/composables/useRepos';
import type { IInvoiceItem, IItem, IUom } from '@/DataLayer/types';
import { onMounted, ref } from 'vue';

  const props = defineProps<{ itemsTable: IInvoiceItem[] }>()
  const emit = defineEmits<{
    (e: 'loaded'): void
    (e: 'item-added' | 'item-removed' | 'item-updated', rows: IInvoiceItem[]): void
  }>()

  // Lookup arrays
  const itemsOptions = ref<IItem[]>([])
  const uomOptions = ref<IUom[]>([])

  // Table rows
  const rows = ref<IInvoiceItem[]>([])
  // Details open flags by row index
  const detailsOpen = ref<boolean[]>([])

  // Helper: render UOM label
  const getUomLabel = (code?: string) => {
    const found = uomOptions.value.find(u => u.uomCode === code)
    return found ? found.description : ''
  }

  // Emit a deep copy of rows
  const plainRows = () => rows.value.map(r => ({ ...r }))

  // Recalculate computed fields and emit update
  function onFieldChange(row: IInvoiceItem) {
    row.valueSalesExcludingST = (row.qty || 0) * row.rate
    row.salesTaxApplicable = row.valueSalesExcludingST * (row.salesTaxRate / 100)
    row.totalValues =
      row.valueSalesExcludingST
      + row.salesTaxApplicable
      - row.salesTaxWithheldAtSource
      - row.lineDiscount
      + row.extraTax
      + row.furtherTax
      + row.fedPayable

    console.log('onFieldChange →', JSON.parse(JSON.stringify(row)))
    emit('item-updated', plainRows())
  }

  // Populate row when user selects a product
  function onItemSelect(hsCode: string, row: IInvoiceItem) {
    console.log('onItemSelect hsCode:', hsCode)
    console.log('itemsOptions:', JSON.parse(JSON.stringify(itemsOptions.value)))
    const match = itemsOptions.value.find(i => i.hsCode === hsCode)
    if (!match) {
      console.warn('No match for HS:', hsCode)
      return
    }

    row.hsCode = match.hsCode!
    row.item = match.name
    row.rate = match.rate
    row.uomCode = match.uomCode
    console.log('Matched item:', match)
    
    row.salesTaxRate = match.defaultSalesTaxRate || 0

    console.log('Populated row:', JSON.parse(JSON.stringify(row)))
    onFieldChange(row)
  }

  // Toggle details visibility for a given index
  function toggleDetails(idx: number) {
    detailsOpen.value[idx] = !detailsOpen.value[idx]
  }

  // Add a fresh blank row
  function addRow() {
    const newRow: IInvoiceItem = {
      id: Date.now(),
      item: '',
      hsCode: '',
      uomCode: '',
      
      quantity: 1,
      rate: 0,
      salesTaxRate: 0,
      salesTaxApplicable: 0,
      salesTaxWithheldAtSource: 0,
      lineDiscount: 0,
      valueSalesExcludingST: 0,
      totalValues: 0,
      extraTax: 0,
      furtherTax: 0,
      fedPayable: 0
    }
    rows.value.push(newRow)
    detailsOpen.value.push(false)
    console.log('addRow → rows:', JSON.parse(JSON.stringify(rows.value)))
    emit('item-added', plainRows())
  }

  // Remove a row at index
  function removeRow(idx: number) {
    rows.value.splice(idx, 1)
    detailsOpen.value.splice(idx, 1)
    console.log('removeRow → rows:', JSON.parse(JSON.stringify(rows.value)))
    emit('item-removed', plainRows())
  }

  // Initialize lookups and rows
  onMounted(async () => {
    itemsOptions.value = await useItemRepo().getAll()
    uomOptions.value = await useUomRepo().getAll()
    console.log('Loaded itemsOptions:', JSON.parse(JSON.stringify(itemsOptions.value)))

    rows.value = props.itemsTable.map(r => ({ ...r }))
    detailsOpen.value = rows.value.map(() => false)
    console.log('Mounted → rows initialized:', JSON.parse(JSON.stringify(rows.value)))
    emit('loaded')
  })

</script>
