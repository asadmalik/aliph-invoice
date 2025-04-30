<script setup lang="ts">
    import type { NavigationMenuItem } from '@nuxt/ui'

    const items = ref<NavigationMenuItem[]>([
        { label: 'Invoices', icon: 'i-lucide-file-text', to: '/invoice' },
        { label: 'New Invoice', icon: 'i-lucide-file-plus', to: '/invoice/new' },
        { label: 'Customers', icon: 'i-lucide-users', to: '/customers' },
        { label: 'New Customer', icon: 'i-lucide-user-plus', to: '/customers/new' },
        { label: 'Items', icon: 'i-lucide-file-text', to: '/items' },
        { label: 'New Item', icon: 'i-lucide-file-plus', to: '/items/new' },
        { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' }
    ])

    /* close the drawer after navigation */
    const router = useRouter()
    const open = ref(false)

    watch(
        () => router.currentRoute.value.fullPath,
        () => (open.value = false)
    )
</script>

<template>
    <!-- Sticky top toolbar -->
    <nav
        class="sticky top-2 z-50 w-full rounded-full border-b border-b-primary-500 bg-white/90 dark:bg-gray-900/90 backdrop-blur">
        <div class="mx-auto flex h-14 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
            <!-- Brand -->
            <NuxtLink to="/" class="flex  flex-grow items-center gap-2 font-semibold text-gray-800 dark:text-gray-200">
                <img src="/img/logo.svg" alt="Aliph Invoice" class="w-[130px]">
            </NuxtLink>

            <!-- Drawer trigger + content -->
            <UDrawer v-model:open="open" side="right" direction="right" dismissible should-scale-background
                set-background-color-on-scale :ui="{ content: 'w-[80vw] max-w-[80vw]' }">
                <!-- trigger button -->
                <UButton icon="i-lucide-menu" color="gray" variant="ghost" aria-label="Open menu" class="text-2xl" />

                <!-- header with round close button -->
                <template #header>
                    <div class="flex justify-end p-4 border-b">
                        <UButton icon="i-lucide-x" color="primary" variant="solid" aria-label="Close menu"
                            class="h-12 w-12 rounded-full text-white hover:scale-105 transition-transform"
                            @click="open = false" />
                    </div>
                </template>

                <!-- nav links -->
                <template #body>
                    <UNavigationMenu :items="items" orientation="vertical" class="p-4 space-y-2" :ui="{
                        icon: { size: 'size-16' },
                        item: {
                            base: 'flex gap-4 items-center text-lg font-medium py-2 px-3 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer'
                        },
                        active: 'text-primary'
                    }" />
                </template>
            </UDrawer>



        </div>
    </nav>
</template>