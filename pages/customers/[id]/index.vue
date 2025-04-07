<template>
  <div>
    Single Customer : {{ customerId }}
  </div>
</template>

<script lang="ts" setup>
  const customerId = useRoute().params['id']

</script>