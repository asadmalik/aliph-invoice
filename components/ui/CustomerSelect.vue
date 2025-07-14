<template>
  <div>
    <USelect
v-model="selectedIdLocal" :items="selectItems" placeholder="Select customer..." filterable clearable
      value-key="value" class="w-full" :avatar="avatar" />

    <UCollapsible v-if="selectedCustomer" title="Customer Details" class="mt-2">
      <UButton
class="group" label="Show Details" color="secondary" variant="link" trailing-icon="i-lucide-chevron-down"
        :ui="{
          trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
        }" />

      <template #content>
        <!-- Header: avatar + name/company -->
        <div class="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
          <img v-if="selectedCustomer.image" :src="selectedCustomer.image" alt="Avatar" class="w-8 h-8 rounded-full">
          <div class="truncate">
            <p class="font-semibold text-sm truncate">{{ selectedCustomer.name }}</p>
            <p class="text-xs text-gray-500 truncate">{{ selectedCustomer.companyName }}</p>
          </div>
        </div>

        <!-- Chips: email, phone, etc. -->
        <div class="flex flex-wrap gap-2 mt-3 px-4 pb-3">
          <UBadge size="sm" variant="outline" class="flex items-center gap-1">
            <UIcon name="i-lucide-mail" class="size-4" />
            <span class="truncate max-w-xs">{{ selectedCustomer.email || '—' }}</span>
          </UBadge>

          <UBadge size="sm" variant="outline" class="flex items-center gap-1">
            <UIcon name="i-lucide-phone" class="size-4" />
            <span>{{ selectedCustomer.phone || '—' }}</span>
          </UBadge>

          <UBadge size="sm" variant="outline" class="flex items-center gap-1">
            <UIcon name="i-lucide-map-pin" class="size-4" />
            <span class="truncate max-w-xs">{{ selectedCustomer.address || '—' }}</span>
          </UBadge>

          <UBadge size="sm" variant="outline" class="flex items-center gap-1">
            <UIcon name="i-lucide-dollar-sign" class="size-4" />
            <span>{{ selectedCustomer.currency || '—' }}</span>
          </UBadge>
        </div>
      </template>
    </UCollapsible>
  </div>
</template>

<script setup lang="ts">
  import type { ICustomer } from '@/DataLayer/types';
import type { AvatarProps, SelectItem } from '@nuxt/ui';
import { useCustomerRepo } from '~/composables/useRepos';

  const props = defineProps<{ modelValue: number | null }>()
  const emit = defineEmits<{
    (e: 'update:modelValue', id: number): void
    (e: 'select', customer: ICustomer): void
  }>()

  const selectedIdLocal = ref<number | null>(props.modelValue)
  const customers = ref<(ICustomer & { image?: string })[]>([])
  const selectItems = ref<SelectItem[]>([])
  const customerRepo = useCustomerRepo()

  onMounted(async () => {
    customers.value = await customerRepo.getAll()
    selectItems.value = customers.value.map(c => ({
      label: c.name,
      value: c.id!,
      avatar: { src: c.image! }
    }))
  })

  const avatar = computed<AvatarProps>(() => {
    return selectItems.value.find(item => item.value === selectedIdLocal.value)?.avatar || { }
  })

  const selectedCustomer = computed<ICustomer | null>(() => {
    return customers.value.find(c => c.id === selectedIdLocal.value) || null
  })

  watch(selectedIdLocal, (newId) => {
    if (newId != null) {
      const cust = selectedCustomer.value!
      emit('update:modelValue', newId)
      emit('select', cust)
      console.log('Selected customer details:', cust)
    }
  })
</script>
