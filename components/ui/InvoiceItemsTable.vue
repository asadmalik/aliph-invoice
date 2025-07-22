<template>
  <UCard
flat class="mb-6 p-0" :ui="{ 
    root:  'sm:p-0 ',      // remove padding from the outer wrapper 
    body:  'sm:p-0 p-0',      // remove padding from the body container 
    footer: 'p-0'      // (if you need) remove padding from a footer slot 
  }">
    <div class="overflow-x-auto">
      <table class="w-full table-auto">
        <thead class="bg-gray-50 border-b">
          <tr class="text-gray-600 text-center text-sm font-semibold uppercase">
            <th class="px-2 py-1 w-6 ">#</th>
            <th class="px-2 py-1">Product</th>
            <th class="px-2 py-1 w-12">UOM</th>
            <th class="px-2 py-1 w-20">Qty</th>
            <th class="px-2 py-1 w-16">Unit<br>Rate</th>
            <th class="px-2 py-1 w-20">Tax<br>Rate (%)</th>
            <th class="px-2 py-1 w-20 text-right">Amount</th>
            <th class="px-2 py-1 w-20">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 text-sm">
          <tr
            v-for="(row, idx) in rows"
            :key="idx"
           class="even:bg-blue-50 hover:bg-gray-100 transition-colors"
          >
            <td class="px-2 py-4">{{ idx + 1 }}</td>
            <td class="px-2 py-4">
              <UInputMenu
                v-model="row.item"
                :items="itemsOptions.map(i => ({ value: i.hsCode!, label: `${i.hsCode} — ${i.name}` }))"
                placeholder="Search by code or name"
                class="w-full"
                @update:model-value="selection => onItemSelect(selection.value, row)"
              />
            </td>
            <td class="px-2 py-4">{{ row.uomCode }}</td>
            <td class="px-2 py-4">
              <UInput
                v-model.number="row.quantity"
                type="number"
                min="0"
                class="w-20 text-right px-1 py-0.5"
                @update:model-value="() => onFieldChange(row)"
              />
            </td>
            <td class="px-2 py-1 text-right">{{ row.rate.toFixed(2) }}</td>
            <td class="px-2 py-1 text-right">{{ row.salesTaxRate?.toFixed(2) }}</td>
            <td class="px-2 py-1 text-right font-semibold">{{ row.totalValues?.toFixed(2) }}</td>
            <td class="px-2 py-4">
              <div class="flex items-center space-x-1 justify-end">
                <UButton variant="link" size="xs" @click="toggleDetails(idx)">
                  Details
                </UButton>
                <UButton
                  icon="i-lucide-x"
                  variant="ghost"
                  size="xs"
                  color="danger"
                  @click="removeRow(idx)"
                />
              </div>
            </td>
          </tr>

          <!-- Details row stays the same but with compact padding -->
          <tr v-for="(row, idx) in rows" :key="'details-' + idx">
            <td
              v-if="detailsOpen[idx]"
              colspan="8"
              class="px-2 py-1 bg-gray-50"
            >
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label class="block font-medium">Sales Tax Amt</label>
                  <div class="mt-1">{{ row.salesTaxApplicable?.toFixed(2) }}</div>
                </div>

                <div>
                  <label class="block font-medium">Withheld Tax</label>
                  <UInput
                    v-model.number="row.salesTaxWithheldAtSource"
                    type="number"
                    class="w-full text-right px-1 py-0.5 mt-1"
                    @update:model-value="() => onFieldChange(row)"
                  />
                </div>

                <div>
                  <label class="block font-medium">Discount</label>
                  <UInput
                    v-model.number="row.lineDiscount"
                    type="number"
                    class="w-full text-right px-1 py-0.5 mt-1"
                    @update:model-value="() => onFieldChange(row)"
                  />
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Row footer -->
    <div class="p-2 border-t bg-gray-50 text-right">
      <UButton color="primary" size="sm" @click="addRow">Add Row</UButton>
    </div>
  </UCard>
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



  // Emit a deep copy of rows
  const plainRows = () => rows.value.map(r => ({ ...r }))

  // Recalculate computed fields and emit update
  function onFieldChange(row: IInvoiceItem) {
    row.valueSalesExcludingST = (row.quantity || 0) * row.rate
    row.salesTaxApplicable = row.valueSalesExcludingST * (row.salesTaxRate / 100)
    row.totalValues =
      row.valueSalesExcludingST
      + row.salesTaxApplicable
      - row.salesTaxWithheldAtSource || 0
      - row.lineDiscount || 0
      + row.extraTax || 0
      + row.furtherTax || 0
      + row.fedPayable || 0

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

  watch(
    () => props.itemsTable,
    (newItems) => {
      // always ensure it's an array
      rows.value = Array.isArray(newItems) ? [...newItems] : []
    },
    { immediate: true, deep: true }
  )

</script>
