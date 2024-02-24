<template>
  <AppHeader />
  <div class="min-w-64 w-1/2 md:w-1/3 mx-auto">
    <UForm ref="form" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormGroup name="title" label="Title">
        <UInput v-model="state.title" />
      </UFormGroup>


      <UFormGroup name="content" label="Content" v-if="state.type.value == ClipTypeEnum.Text">
        <UTextarea v-model="state.content" />
      </UFormGroup>

      <UFormGroup name="content" label="Content" v-if="state.type.value == ClipTypeEnum.Image">
        <UInput type="file" size="sm" />
      </UFormGroup>

      <UFormGroup name="content" label="Content" v-if="state.type.value == ClipTypeEnum.File">
        <UInput v-model="state.file" type="file" size="sm" />
      </UFormGroup>

      <UFormGroup name="selectMenuTypeOption" label="Select Type option">
        <USelectMenu v-model="state.type" placeholder="Select..." :options="typeOptions" />

      </UFormGroup>

      <UFormGroup name="selectMenuTimeToLive" label="Select TimeToLive option">
        <USelectMenu v-model="state.timeToLive" placeholder="Select..." :options="ttlOptions" icon="i-heroicons-clock" />
      </UFormGroup>

      <div class="flex justify-center">
        <UButton type="submit" variant="soft">
          Submit
        </UButton>
      </div>
    </UForm>
  </div>
  <div v-if="submitError">
    <p>{{ submitError }}</p>
  </div>
</template>

<script lang="ts" setup>
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import { ClipTypeEnum, TttEnum, type Clip } from '~/models/clip.model';

const typeOptions = [
  { label: 'Text', value: ClipTypeEnum.Text },
  { label: 'Image', value: ClipTypeEnum.Image },
  { label: 'File', value: ClipTypeEnum.File }
]

const ttlOptions = [
  { label: 'A Day', value: TttEnum.Day },
  { label: 'A Week', value: TttEnum.Week },
  { label: 'A Month', value: TttEnum.Month }
]

const state = reactive({
  title: undefined,
  content: undefined,
  file: undefined,
  type: typeOptions[0],
  timeToLive: ttlOptions[0],
})

const schema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  file: z.any(),
  type: z.any(),
  timeToLive: z.any(),
})

type Schema = z.infer<typeof schema>

const form = ref();
let submitError = ref();

async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log("submit")
  const clip: Clip = {
    path: 'test',
    title: event.data.title,
    content: event.data.content,
    type: ClipTypeEnum.Text,
    timeToLive: TttEnum.Day,
  };

  const { data: newClip, error: submitError } = await useFetch<Clip>('http://localhost:7071/api/clip/add', {
    method: 'POST',
    body: JSON.stringify(clip),
  });

  // redirect to path
  if (newClip.value) await navigateTo(`/find/${newClip.value.path}`);


  console.log(newClip);
}
</script>

<style></style>