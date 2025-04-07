<template>
  <div class="max-w-5xl mx-auto p-6">
    <!-- Header & CTA -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">Customers</h1>
      <NuxtLink to="/customers/new">
        <UButton icon="i-heroicons-plus" color="primary">New Customer</UButton>
      </NuxtLink>
    </div>

    <!-- Customers Table -->
    <UTable :data="customers" :columns="columns" :loading="loading" empty-state="No customers yet." class="flex-1"
      :ui="{ tr: 'odd:bg-gray-50 dark:odd:bg-gray-800' }" />
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from '#imports'
  import type { TableColumn } from '@nuxt/ui'
  import Dexie from 'dexie'
  import { h, resolveComponent } from 'vue'

  interface Customer {
    id?: number
    image: string
    name: string
    phone: string
    email: string
    companyName: string
    currency: string
  }

  class CustomersDB extends Dexie {
    customers!: Dexie.Table<Customer, number>
    constructor() {
      super('aliph_invoice')
      this.version(1).stores({
        customers: '++id,name,phone,email'
      })
    }
  }

  const db = new CustomersDB()
  const router = useRouter()

  const customers = ref<Customer[]>([])
  const loading = ref(true)

  const fetchCustomers = async () => {
    customers.value = await db.customers.toArray()
  }

  onMounted(async () => {
    await fetchCustomers()
    loading.value = false
  })

  const deleteCustomer = async (id: number) => {
    await db.customers.delete(id)
    await fetchCustomers()
  }

  const NuxtLink = resolveComponent('NuxtLink')
  const UButton = resolveComponent('UButton')

  const columns: TableColumn<Customer>[] = [
    {
      accessorKey: 'image',
      header: 'Image',
      sortDescFirst: false,
      cell: ({ row }) => {
        const src = row.getValue('image') as string
        return src
          ? h('img', { src, class: 'h-10 w-10 rounded-full object-cover' })
          : h(
            'div',
            {
              class:
                'h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500'
            },
            'N/A'
          )
      }
    },
    {
      accessorKey: 'name',
      header: 'Name',
      sortDescFirst: true,
      cell: ({ row }) =>
        h(
          NuxtLink as any,
          {
            to: `/customers/${row.original.id}`,
            class: 'text-primary-600 hover:underline'
          },
          () => row.getValue('name') as string
        )
    },
    { accessorKey: 'phone', header: 'Phone', sortDescFirst: true },
    { accessorKey: 'email', header: 'Email', sortDescFirst: true },
    { accessorKey: 'companyName', header: 'Company', sortDescFirst: true },
    { accessorKey: 'currency', header: 'Currency', sortDescFirst: true },
    {
      id: 'actions',
      header: 'Actions',
      sortDescFirst: false,

      cell: ({ row }) =>
        h(
          'div',
          { class: 'flex gap-2 justify-end' },
          [
            h(UButton as any, {
              icon: 'i-heroicons-pencil-square',
              color: 'gray',
              variant: 'ghost',
              size: 'xs',
              square: true,
              title: 'Edit',
              onClick: () => router.push(`/customers/${row.original.id}/edit`)
            }),
            h(UButton as any, {
              icon: 'i-heroicons-trash',
              color: 'red',
              variant: 'ghost',
              size: 'xs',
              square: true,
              title: 'Delete',
              onClick: () => deleteCustomer(row.original.id as number)
            })
          ]
        )
    },
  ]
</script>
