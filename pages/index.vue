<template>
  <AppHeader />
  <AppSearch />
  <div class="flex items-center justify-center space-x-6">
    <UButton size="md" variant="soft" icon="i-heroicons-pencil-square">
      <NuxtLink to="/add">
        Create a new clip
      </NuxtLink>
    </UButton>
  </div>
</template>

<script lang="ts" setup>

</script>