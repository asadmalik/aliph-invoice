<script setup lang="ts">
  import type { AvatarProps } from '@nuxt/ui';
  const selectedUser = ref();
  const { data: users, status } = await useFetch('https://jsonplaceholder.typicode.com/users', {
    key: 'typicode-users',
    transform: (data: { id: number, name: string }[]) => {
      return data?.map(user => ({
        label: user.name,
        value: String(user.id),
        avatar: { src: `https://i.pravatar.cc/120?img=${user.id}` }
      }))
    },
    lazy: true
  })
  console.log('tyicode data: ', users.value)

  function getUserAvatar(value: string) {
    selectedUser.value = users.value?.find(user => user.value === value) || {}
    console.log('user selected: ', selectedUser)
    return users.value || {};
  }
</script>

<template>

  <USelect :items="users" :loading="status === 'pending'" icon="i-lucide-user" placeholder="Select user" class="w-96"
    value-key="value">
    <template #leading="{ modelValue, ui }">
      <UAvatar v-if="modelValue" v-bind="getUserAvatar(modelValue)"
        :size="(ui.leadingAvatarSize() as AvatarProps['size'])" :class="ui.leadingAvatar()" />
    </template>
  </USelect>
  <UCard v-if="selectedUser">
    <template #header>
      {{ selectedUser.label }}
    </template>

    <Placeholder class="h-32" />

    <template #footer>
      <Placeholder class="h-8" />
    </template>
  </UCard>
</template>

