<template>
  <AppHeader />
  <AppSearch />
  <div v-if="error">
    <h1 class="text-3xl pb-8 text-center">Clip not found</h1>
  </div>
  <div v-else class="flex flex-col items-center">
    <h1 class="text-xl lg:text-4xl pb-4">{{ fullClipUrl }}</h1>
    <UButton class="mb-4" icon="i-heroicons-clipboard-document" size="sm" color="primary" square variant="soft"
      @click="copy">
    </UButton>


    <UCard>
      <template #header>
        <div class="w-100">
          <h1 class="text-2xl text-center">{{ clip!.title }}</h1>
        </div>

      </template>

      <div class="w-100">
        <p>{{ clip!.content }}</p>
      </div>

      <template #footer>
        <div class="w-100">
          <img :src="clip!.file" alt="clip.file" />
        </div>
      </template>


    </UCard>
  </div>
</template>

<script lang="ts" setup>
import { type Clip } from '@/models/clip.model';

const toast = useToast()

const config = useRuntimeConfig();
const baseAppUrl = config.public.baseAppUrl;
const baseApiUrl = config.public.baseApiUrl;

console.log('baseAppUrl', baseAppUrl);

const fullClipUrl = computed(() => {
  return baseAppUrl + '/find/' + path;
});
// Get path from URL
const route = useRoute();
const path = route.params.path;

function copy() {
  navigator.clipboard.writeText(fullClipUrl.value);
  toast.add({ title: 'Clip url copied to Clipboard !', timeout: 2000 })
  console.log('copied');
}

const { error, data: clip } = await useFetch<Clip>(`${baseApiUrl}/api/clip/get/${path}`, {
  method: 'GET',
});


</script>

<style></style>