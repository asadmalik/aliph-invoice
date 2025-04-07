<script setup lang="ts">
    import type { NavigationMenuItem } from '@nuxt/ui';

    const items = ref<NavigationMenuItem[]>([
        { label: 'New Invoice', icon: 'i-lucide-file-plus', to: '/invoice/new' },
        { label: 'Invoices', icon: 'i-lucide-file-text', to: '/invoice' },
        { label: 'New Customer', icon: 'i-lucide-user-plus', to: '/customers/new' },
        { label: 'Customers', icon: 'i-lucide-users', to: '/customers' },
        { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' }
    ])
</script>

<template>
    <!-- Sticky top toolbar -->
    <nav
        class="sticky top-2 z-50 w-full border-b border-b-primary-500 bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-full">
        <div class="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <!-- Brand -->
            <NuxtLink to="/" class="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200">
                <UIcon name="i-lucide-file-text" class="size-6 text-primary" />
                <span class="hidden sm:inline">Aliph&nbsp;Invoice</span>
            </NuxtLink>

            <!-- Navigation -->
            <UNavigationMenu :items="items" orientation="horizontal" class="gap-4 overflow-x-auto" :ui="{
                icon: { size: 'size-6' },
                item: { base: 'flex flex-col items-center text-xs sm:text-sm' },
                active: 'text-primary'
            }" />
        </div>
    </nav>
</template>
