<template>
  <div>
    Single Customer : {{ customerId }}
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'default',
  title: 'Customer Details'
})
useSeoMeta({
  title: 'Customer Details',
  description: 'View detailed information about the customer including invoices and transactions.'
})



  const customerId = useRoute().params['id']

</script>