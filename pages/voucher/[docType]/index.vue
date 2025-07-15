<template>
  <div>
    <h1>{{ pageTitle }} Listing Page</h1>

  </div>
</template>

<script lang="ts" setup>
  // — Page Title & Meta —
  const pageTitle = computed(() => {
    const docType = useRoute().params.docType as 'sale' | 'purchase' | 'credit' || 'sale'
    return docType === 'credit' ? 'Credit Note' : `${docType.charAt(0).toUpperCase() + docType.slice(1)} Invoice`
  })

  definePageMeta({
    title: pageTitle,
    layout: 'default'
  })

  // — Route & Doc-Type Mapping (Nuxt auto-imports useRoute) —
/*   const docType = useRoute().params.docType as 'sale' | 'purchase' | 'credit' || 'sale'
  const docTypeMap = {
    sale: { label: 'Sale Invoice', documentTypeId: 4, defaultTransType: 1 },
    purchase: { label: 'Purchase Invoice', documentTypeId: 5, defaultTransType: 1 },
    credit: { label: 'Credit Note', documentTypeId: 12, defaultTransType: 3 }
  }
  const { label: docTypeLabel, documentTypeId, defaultTransType } = docTypeMap[docType] */
</script>