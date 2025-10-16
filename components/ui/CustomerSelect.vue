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
            <UIcon name="lucide:check-check" class="size-4" />
            <span class="truncate max-w-xs">{{ selectedCustomer.registrationType || 'not registered' }}</span>
          </UBadge>

          <UBadge size="sm" variant="outline" class="flex items-center gap-1">
            <UIcon name="i-lucide-id-card" class="size-4" />
            <span>CNIC/NTN: {{ selectedCustomer.ntnCnic || '—' }}</span> 
          </UBadge>


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
            <span>{{ selectedCustomer.currency || 'PKR' }}</span>
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

  // Local selection
  const selectedIdLocal = ref<number | null>(props.modelValue)

  // **1️⃣ Sync parent → child whenever modelValue changes**
  watch(
    () => props.modelValue,
    (newVal) => {
      selectedIdLocal.value = newVal
    }
  )

  // Load customers
  const customers = ref<(ICustomer & { image?: string })[]>([])
  const selectItems = ref<SelectItem[]>([])
  const customerRepo = useCustomerRepo()

  onMounted(async () => {
    customers.value = await customerRepo.getAll()
    selectItems.value = customers.value.map(c => ({
      label: c.name,
      value: c.id!,
      avatar: { src: c.image! },
    }))
  })

  // Avatar & details
  const avatar = computed<AvatarProps>(() => {
    // Type guard for SelectItem object
    const item = selectItems.value.find(
      (i): i is SelectItem => typeof i === 'object' && i !== null && 'value' in i
        && i.value === selectedIdLocal.value
    );
    return item?.avatar || {};
  })
  const selectedCustomer = computed<ICustomer | null>(() =>
    customers.value.find(c => c.id === selectedIdLocal.value) || null
  )

  // **2️⃣ Emit both the v-model change and the full object on selection**
  watch(selectedIdLocal, (newId) => {
    if (newId != null) {
      const cust = selectedCustomer.value!
      emit('update:modelValue', newId)
      emit('select', cust)
    }
  })
</script>
