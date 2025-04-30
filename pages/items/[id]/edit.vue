<!--  pages\items\[id]\edit.vue  -->  
<template>
    <div class="w-5xl mx-auto p-6">
        <h1 class="text-2xl font-semibold mb-6">Edit Item</h1>

        <!-- Loading indicator -->
        <div v-if="loading" class="text-center py-10">Loading…</div>

        <!-- Item form -->
        <UForm v-else :state="form" @submit="handleSubmit">
            <div class="grid gap-4">
                <UInput v-model="form.name" label="Name" placeholder="Service / Product name" required />

                <!-- Unit Type -->
                <USelect v-model="form.unitType" :items="unitTypes" option-attribute="label" value-attribute="value"
                    label="Unit Type" />

                <UInput v-model.number="form.rate" label="Rate" type="number" min="0" step="any" />

                <UButton type="submit" class="mt-4">Save Item</UButton>
            </div>
        </UForm>

        <!-- Success alert -->
        <UAlert v-if="saved" title="Woohoo!" description="Item saved." color="neutral" variant="outline" close
            class="mt-10" />
    </div>
</template>

<script setup lang="ts">
    import { useItemRepo } from '@/composables/useRepos'
    import type { IItem, UnitType } from '@/DataLayer/types'


    const route = useRoute()
    const router = useRouter()

    // base reactive form
    const form = reactive<IItem>({
        name: '',
        unitType: 'Fixed' as UnitType,
        rate: 0,
    })

    const unitTypes = [
        { label: 'Fixed', value: 'Fixed' },
        { label: 'Hourly', value: 'Hourly' }
    ]

    const saved = ref(false)
    const loading = ref(true)
    let itemRepo: ReturnType<typeof useItemRepo> | null = null

    onMounted(async () => {
        itemRepo = useItemRepo()
        const id = Number(route.params.id)
        const data = await itemRepo.get(id)
        console.log(data)

        if (!data) {
            // Item not found, redirect back to list
            return router.push('/items')
        }

        Object.assign(form, data)
        loading.value = false
    })

    const handleSubmit = async () => {
        if (!itemRepo) return

        await itemRepo.update(Number(route.params.id), { ...form })
        saved.value = true
        setTimeout(() => (saved.value = false), 3000)
    }
</script>