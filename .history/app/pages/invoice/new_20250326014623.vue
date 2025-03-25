<template>
  <div>
    <UContainer as="div">
      <div class="w-full">
        <UFormField label="Customer Name" labelPlacement="bottom">
          <USelect :items="customers"></USelect>
        </UFormField>
      </div>


    </UContainer>
    
  </div>
</template>

<script lang="ts" setup>
const customers = ref([
  {name: 'John Smith', email: 'John@Smith.com', currency:'GBP', address:'123 Park Road, Awesomeville, Uganda'}
])
</script>