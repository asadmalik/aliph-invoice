<template>
  <div>
    <!-- Invoice Items Table built with Nuxt UI components -->
    <table class="min-w-full table-auto border-collapse">
      <thead>
        <tr>
          <th class="border px-2">Sr.</th>
          <th class="border px-2 text-left">Item</th>
          <th class="border px-2">Qty</th>
          <th class="border px-2">Rate</th>
          <th class="border px-2">Tax</th>
          <th class="border px-2">Amount</th>
          <th class="border px-2">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, idx) in rows" :key="row.id || idx">
          <td class="border px-2">{{ idx + 1 }}</td>

          <td class="border px-2">
            <UInputMenu
              v-model="row.item"
              :items="itemNames"
              placeholder="Select or enter item"
              class="w-full"
              @update:model-value="val => onItemSelect(val, row)"
            />
          </td>

          <td class="border px-2">
            <UInput v-model.number="row.qty" type="number" class="w-16 text-right"  @update:model-value="() => touchRow(row)"/>
          </td>

          <td class="border px-2">
            <UInput v-model.number="row.rate" type="number" class="w-20 text-right"  @update:model-value="() => touchRow(row)"/>
          </td>

          <td class="border px-2">
            <USelect
              v-model.number="row.tax"
              :items="taxSelectItems"
              class="w-24"
               @update:model-value="() => touchRow(row)"
            />
          </td>

          <td class="border px-2 text-right">
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
/* types */
import type { IInvoiceItem, IItem, ITaxItem } from '@/DataLayer/types';
import { onMounted, ref, toRaw, watch } from 'vue';

/* ─────────────────────────────────────────────────────────────── */
/* props / emits                                                   */
/* ─────────────────────────────────────────────────────────────── */
const props = defineProps<{
  itemsTable: IInvoiceItem[]
}>()

const emit = defineEmits<{
  (e: 'loaded'): void
  (e: 'item-added'   , rows: IInvoiceItem[]): void
  (e: 'item-removed' , rows: IInvoiceItem[]): void
  (e: 'item-updated' , rows: IInvoiceItem[]): void
}>()

/* ─────────────────────────────────────────────────────────────── */
/* local state                                                     */
/* ─────────────────────────────────────────────────────────────── */
const rows         = ref<IInvoiceItem[]>([])
const itemsOptions = ref<IItem[]>([])
const taxItems     = ref<ITaxItem[]>([])

/* helper → clone plain rows for emit (no Vue proxies) */
function plainRows (): IInvoiceItem[] {
  return rows.value.map(r => ({ ...toRaw(r) }))
}

/* recalc one row & emit update */
function touchRow (row: IInvoiceItem) {
  row.amount = row.qty * row.rate - row.tax
  emit('item-updated', plainRows())
}

/* ─────────────────────────────────────────────────────────────── */
/* init                                                            */
/* ─────────────────────────────────────────────────────────────── */
onMounted(async () => {
  rows.value = props.itemsTable.length
    ? props.itemsTable.map(r => ({ ...r }))
    : []

  const [itemList, taxList] = await Promise.all([
    useItemRepo().getAll(),
    useTaxItemRepo().getAll()
  ])
  itemsOptions.value = itemList
  taxItems.value     = taxList

  emit('loaded')
})

/* refresh if parent replaces the array (reset form)  */
watch(() => props.itemsTable, (arr) => {
  rows.value = arr.map(r => ({ ...r }))
})

/* ─────────────────────────────────────────────────────────────── */
/* field handlers                                                  */
/* ─────────────────────────────────────────────────────────────── */
function onItemSelect (val: string, row: IInvoiceItem) {
  const match = itemsOptions.value.find(i => i.name === val)
  if (match) {
    row.item = match.name
    row.rate = match.rate        // auto‑fill rate
  } else {
    row.item = val
  }
  touchRow(row)
}

function addRow () {
  rows.value.push({ id: Date.now(), item:'', qty:1, rate:0, tax:0, amount:0 })
  emit('item-added', plainRows())
}

function removeRow (idx: number) {
  rows.value.splice(idx, 1)
  emit('item-removed', plainRows())
}

/* expose to template */
const itemNames = computed(() => itemsOptions.value.map(i => i.name))
</script>

