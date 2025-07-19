<template>
  <UContainer class="max-w-6xl py-10">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold">All Items</h1>
      <UButton to="/items/new" icon="i-heroicons-plus" color="primary">Add New Item</UButton>
    </div>

    <UTable :rows="items" :data="items" :columns="columns" :loading="loading">
      <template #name-data="{ row }">
        {{ row.name }}
      </template>
      <template #hsCode-data="{ row }">
        {{ row.hsCode }}
      </template>
      <template #rate-data="{ row }">
        {{ row.rate }}
      </template>
      <template #unitType-data="{ row }">
        {{ row.unitType }}
      </template>
      <template #fbrSaleType-data="{ row }">
        {{ row.fbrSaleType }}
      </template>
      <template #actions-data="{ row }">
        <div class="flex gap-2">
          <UButton size="xs" icon="i-heroicons-eye" color="gray" variant="soft" :to="`/items/${row.id}`">
            View
          </UButton>
          <UButton size="xs" icon="i-heroicons-pencil-square" color="blue" variant="soft" :to="`/items/${row.id}/edit`">
            Edit
          </UButton>
          <UButton size="xs" icon="i-heroicons-trash" color="red" variant="soft" @click="confirmDelete(row.id)">
            Delete
          </UButton>
        </div>
      </template>
    </UTable>


    <UModal v-if="showDeleteConfirm" v-model="showDeleteConfirm" prevent-close>
      <UCard>
        <template #header>
          <div class="text-lg font-semibold">Confirm Deletion</div>
        </template>

        <p>Are you sure you want to delete this item?</p>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="soft" @click="showDeleteConfirm = false">Cancel</UButton>
            <UButton color="error" @click="deleteItem">Delete</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </UContainer>
</template>

<script setup lang="ts">
  
import { UButton } from '#components'
import type { IItem } from '@/DataLayer/types'

import type { TableColumn } from '@nuxt/ui'
import { h } from 'vue'

  definePageMeta({ layout: 'default' })

  const router = useRouter()

  const itemRepo = useItemRepo()
  const items = shallowRef<IItem[]>([])
  const loading = ref(true)

  /* const showDeleteConfirm = ref(false)
  const itemToDelete = ref<string | null>(null) */

  const columns: TableColumn<IItem>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) =>
        h(
          'span',
          { class: 'font-medium text-gray-800' },
          row.getValue('name') as string
        )
    },
    {
      accessorKey: 'hsCode',
      header: 'HS Code'
    },
    {
      accessorKey: 'rate',
      header: 'Rate',
      cell: ({ row }) => `Rs. ${parseFloat(row.getValue('rate')).toFixed(2)}`
    },
    {
      accessorKey: 'unitType',
      header: 'Unit Type'
    },
    {
      accessorKey: 'fbrSaleType',
      header: 'FBR Sale Type'
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) =>
        h(
          'div',
          { class: 'flex gap-2 justify-end' },
          [
            h(UButton as any, {
              icon: 'i-heroicons-eye',
              color: 'gray',
              variant: 'ghost',
              size: 'xs',
              square: true,
              title: 'View',
              onClick: () => router.push(`/items/${row.original.id}`)
            }),
            h(UButton as any, {
              icon: 'i-heroicons-pencil-square',
              color: 'blue',
              variant: 'ghost',
              size: 'xs',
              square: true,
              title: 'Edit',
              onClick: () => router.push(`/items/${row.original.id}/edit`)
            }),
            /* h(UButton as any, {
              icon: 'i-heroicons-trash',
              color: 'red',
              variant: 'ghost',
              size: 'xs',
              square: true,
              title: 'Delete',
              onClick: () => confirmDelete(row.original.id)
            }) */
          ]
        )
    }
  ]

  const fetchItems = async () => {
    loading.value = true
    items.value = await itemRepo.getAll()
    loading.value = false
    console.log('Items loaded:', items.value);
  }

  onMounted(fetchItems)

 /*  const confirmDelete = (id: string) => {
    itemToDelete.value = id
    showDeleteConfirm.value = true
  } */

  /* const deleteItem = async () => {
    if (!itemToDelete.value) return

    await itemRepo.delete(itemToDelete.value)
    await fetchItems()
    showDeleteConfirm.value = false
    itemToDelete.value = null
  } */
</script>
