<template>
  <UCard
flat class="mb-6 p-0" :ui="{
    root: 'sm:p-0 ',      // remove padding from the outer wrapper 
    body: 'sm:p-0 p-0',      // remove padding from the body container 
    footer: 'p-0'      // (if you need) remove padding from a footer slot 
  }">
    <div class="overflow-x-auto">
      <table class="w-full table-fixed">
        <thead class="bg-gray-50 border-y border-blue-200">
          <tr class="text-gray-600 text-left font-semibold uppercase text-xs">
            <th class="px-2 py-1 w-6 border-r border-blue-200">#</th>
            <th class="px-2 py-1 w-96 text-left text-sm border-r border-blue-200">Product</th>
            <th class="px-2 py-1 w-16 border-r border-blue-200">Qty</th> <!-- reduced from w-16 -->
            <th class="px-2 py-1 w-16 border-r border-blue-200">Rate</th>
            <th class="px-2 py-1 w-16 border-r border-blue-200">Sales Tax</th>
            <th class="px-2 py-1 w-24 text-right border-r border-blue-200">Amount</th>
            <th class="px-2 py-1 w-16 text-right">Actions</th> <!-- reduced from w-16 -->
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 text-sm">
          <template v-for="(row, idx) in rows" :key="idx">
            <tr class="even:bg-blue-50 hover:bg-gray-100 transition-colors">
              <!-- Row number -->
              <td class="px-2 py-4 align-middle text-center">{{ idx + 1 }}</td>

              <!-- Product + UOM badge -->
              <td class="px-2 py-4 align-middle w-full flex items-center gap-2">
                <UInputMenu
v-model="row.item"
                  :items="itemsOptions.map(i => ({ value: i.hsCode!, label: `${i.hsCode} — ${i.name}` }))"
                  placeholder="Search by code or name" class="flex-1"
                  @update:model-value="selection => onItemSelect(selection.value, row)" />
                <UBadge v-if="row.uomCode" variant="subtle">{{ row.uomCode }}</UBadge>
              </td>

              <!-- Qty -->
              <td class="px-2 py-4 align-middle text-center">
                <UInput
v-model.number="row.quantity" variant="subtle" type="number" min="0" class="text-right"
                  @update:model-value="() => onFieldChange(row)" />
              </td>

              <!-- Unit Rate -->
              <td class="px-2 py-4 align-middle text-right">
                {{ row.rate.toFixed(2) }}
              </td>

              <!-- Tax Rate -->
              <td class="px-2 py-4 align-middle text-right">
                {{ row.salesTaxRate?.toFixed(2) }}%
              </td>

              <!-- Amount -->
              <td class="px-2 py-4 align-middle text-right font-semibold">
                {{ row.totalValues?.toFixed(2) }}
              </td>

              <!-- Actions -->
              <td class="px-2 py-4 align-middle flex items-center justify-end space-x-1 ">
                <UButton
icon="lucide-chevron-down" variant="outline" size="xs" title="Show More Taxes"
                  @click="row.showDetails = !row.showDetails" />

                <UButton
icon="i-lucide-x" variant="outline" class="rounded-full" size="xs" color="error"
                  title="Delete Row" @click="removeRow(idx)" />

              </td>
            </tr>
            <tr v-if="row.showDetails" class="bg-gray-50">
              <td colspan="6" class="px-2 py-1 bg-gray-50">
                <div class="px-2 py-1 bg-gray-50 w-full">
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label class="block font-medium">Sales Tax Amt</label>
                      <div class="mt-1">{{ row.salesTaxApplicable?.toFixed(2) }}</div>
                    </div>

                    <div>
                      <label class="block font-medium">Withheld Tax</label>
                      <UInput
v-model.number="row.salesTaxWithheldAtSource" type="number"
                        class="w-full text-right px-1 py-0.5 mt-1" @update:model-value="() => onFieldChange(row)" />
                    </div>

                    <div>
                      <label class="block font-medium">Discount</label>
                      <UInput
v-model.number="row.lineDiscount" type="number" class="w-full text-right px-1 py-0.5 mt-1"
                        @update:model-value="() => onFieldChange(row)" />
                    </div>
                  </div>
                </div>
              </td>
            </tr>

          </template>



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
  interface LineRow extends IInvoiceItem {
    showDetails?: boolean,
    item?: IItem,
  }
  // Table rows
  const rows = ref<LineRow[]>([])




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



  // Add a fresh blank row
  function addRow() {
    const newRow: LineRow = {
      id: Date.now(),
      itemId: 0,
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
      fedPayable: 0,
      showDetails: false
    }
    rows.value.push(newRow)

    console.log('addRow → rows:', JSON.parse(JSON.stringify(rows.value)))
    emit('item-added', plainRows())
  }

  // Remove a row at index
  function removeRow(idx: number) {
    rows.value.splice(idx, 1)

    //console.log('removeRow → rows:', JSON.parse(JSON.stringify(rows.value)))
    emit('item-removed', plainRows())
  }

  // Initialize lookups and rows
  onMounted(async () => {
    itemsOptions.value = await useItemRepo().getAll()
    uomOptions.value = await useUomRepo().getAll()
    console.log('Loaded itemsOptions:', JSON.parse(JSON.stringify(itemsOptions.value)))

    rows.value = props.itemsTable.map(r => ({ ...r }))

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
