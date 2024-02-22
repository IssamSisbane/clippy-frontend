<template>
  <AppHeader />

  <div v-if="found" class="flex flex-col items-center">
    <h1 class="text-4xl pb-8">/{{ clip!.path }}</h1>
    <UCard>
      <template #header>
        <div class="w-64">
          <h1 class="text-2xl text-center">{{ clip!.title }}</h1>
        </div>

      </template>
      <div class="w-64">
        <p>{{ clip!.content }}</p>
      </div>

    </UCard>
  </div>
  <div v-else>
    <h1>Clip not found</h1>
  </div>
</template>

<script lang="ts" setup>
import { type Clip, TttEnum, ClipTypeEnum } from '@/models/clip.model';

// Get path from URL
const route = useRoute();
const path = route.params.path;

const found = ref(false);

const { error, data: clip } = await useFetch<Clip>('http://localhost:7071/api/clip/get/' + path, {
  method: 'GET',
});
console.log(clip.value);
console.log(error.value);

if (error.value) {
  console.log(error.value.statusMessage);
  console.log(error.value.statusCode);
  console.log(error.value.data);
} else {
  found.value = true;
  clip.value = clip.value;

}

</script>

<style></style>