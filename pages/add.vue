<template>
  <AppHeader />
  <div class="min-w-64 w-1/2 md:w-1/3 mx-auto">
    <UForm ref="form" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormGroup name="input" label="Input">
        <UInput v-model="state.input" />
      </UFormGroup>

      <UFormGroup name="textarea" label="Textarea">
        <UTextarea v-model="state.textarea" />
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

const state = reactive({
  input: undefined,
  textarea: undefined,
})

const schema = z.object({
  input: z.string().min(1),
  textarea: z.string().min(1)
})

type Schema = z.infer<typeof schema>

const form = ref();
let submitError = ref();

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const clip: Clip = {
    path: 'test',
    title: event.data.input,
    content: event.data.textarea,
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