<template>
  <UContainer class="max-w-6xl py-10">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold">All Customers</h1>
      <UButton to="/customers/new" icon="i-heroicons-plus" color="primary">
        New Customer
      </UButton>
    </div>

    <UTable
:data="customers" :columns="columns" :loading="loading" class="rounded-md shadow-sm"
      empty-state="No customers yet." />

    
  </UContainer>
</template>

<script setup lang="ts">
  
import type { ICustomer } from '@/DataLayer/types'
import type { TableColumn } from '@nuxt/ui'

  definePageMeta({
    layout: 'default',
    title: 'All Customers'
  })
  useSeoMeta({
    title: 'All Customers',
    description: 'Manage your customers, view details, and edit information.'
  })


  const router = useRouter()
  const customerRepo = useCustomerRepo()

  const customers = ref<ICustomer[]>([])
  const loading = ref(true)

  

  onMounted(async () => {
    if (!import.meta.client) return
    customers.value = await customerRepo.getAll()
    loading.value = false
  })

  

  const columns: TableColumn<ICustomer>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) =>
        h(resolveComponent('NuxtLink'), {
          to: `/customers/${row.original.id}`,
          class: 'text-primary-600 hover:underline'
        }, () => row.getValue('name'))
    },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'companyName', header: 'Company' },
    { accessorKey: 'currency', header: 'Currency' },
    { accessorKey: 'provinceCode', header: 'Province' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) =>
        h('div', { class: 'flex gap-2 justify-end' }, [
          h(resolveComponent('UButton'), {
            icon: 'i-heroicons-pencil-square',
            color: 'gray',
            variant: 'ghost',
            size: 'xs',
            square: true,
            title: 'Edit',
            onClick: () => router.push(`/customers/${row.original.id}/edit`)
          })
        ])
    }
  ]
</script>
