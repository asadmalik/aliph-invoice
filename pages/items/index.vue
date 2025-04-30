<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable vue/first-attribute-linebreak -->
<template>
  <div class="w-full mx-auto p-4 sm:p-6">
    <!-- Header & CTA -->
    <div class="flex items-center justify-between mb-4 sm:mb-6">
      <h1 class="text-2xl font-semibold">Items</h1>
      <UButton to="/items/new" icon="i-lucide-plus" color="primary">
        New Item
      </UButton>
    </div>

    <!-- Responsive wrapper gives horizontal scroll on very small screens -->
    <div class="w-full overflow-x-auto">
      <UTable :data="rows" :columns="columns" class="flex-1"
        :ui="{ table: 'w-full', td: 'align-middle whitespace-nowrap' }" />
    </div>

    <UAlert v-if="!rows.length" color="gray" variant="subtle" class="mt-6">
      No items have been added yet.
    </UAlert>
  </div>
</template>

<script setup lang="ts">
  //eslint-disable @typescript-eslint/no-explicit-any
  import type { IItem } from '@/DataLayer/types'

  const itemRepo = useItemRepo()

  // ---------- Reactive state ----------
  const rows = ref<IItem[]>([])

  // ---------- Column definitions ----------
  const columns = [
    {
      accessorKey: 'name',
      label: 'Name',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cell: (cell: any) =>
        h(
          resolveComponent('NuxtLink'),
          { to: `/items/${cell.row.original.id}`, class: 'underline text-blue-400 hover:text-muted' },
          { default: () => cell.getValue() }
        ),
    },
    {
      accessorKey: 'unitType',
      label: 'Unit Type',
    },
    {
      accessorKey: 'rate',
      label: 'Rate',
      cell: (cell: any) => {
        const num = Number(cell.getValue())
        return isNaN(num)
          ? '-'
          : num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
      },
    },
    {
      accessorKey: 'id',
      label: 'Actions',
      cell: (cell: any) =>
        h(
          'div',
          { class: 'flex gap-2 justify-end' },
          [
            h(
              resolveComponent('UButton'),
              {
                color: 'primary',
                icon: 'i-lucide-pencil',
                size: 'xs',
                square: true,
                title: 'Edit',
                to: `/items/${cell.getValue()}/edit`,
              }
            ),
            h(
              resolveComponent('UButton'),
              {
                color: 'red',
                icon: 'i-lucide-trash',
                size: 'xs',
                square: true,
                title: 'Delete',
                onClick: () => deleteItem(cell.getValue()),
              }
            ),
          ]
        ),
    },
  ]

  // ---------- Methods ----------
  const loadItems = async () => {
    rows.value = await itemRepo.getAll()
  }

  const deleteItem = async (id: number) => {
    if (!confirm('Delete this item?')) return
    await itemRepo.delete(id)
    rows.value = rows.value.filter((item) => item.id !== id)
  }

  onMounted(loadItems)
</script>
<style scoped></style>