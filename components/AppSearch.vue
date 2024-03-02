<template>
  <div class="min-w-64 w-1/2 md:w-1/3 mx-auto mb-5">
    <UForm ref="form" @submit="onSubmit" :state="state" :schema="schema">
      <UInput v-model="state.input" name="q" placeholder="Search for a clip..."
        icon="i-heroicons-magnifying-glass-20-solid" autocomplete="off">
      </UInput>
    </UForm>
  </div>
</template>

<script lang="ts" setup>
import { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types'

const schema = z.object({
  input: z.string().min(1),
})

type Schema = z.infer<typeof schema>

const form = ref()
const state = reactive({
  input: undefined,
})

function onSubmit(event: FormSubmitEvent<Schema>) {
  navigateTo(`/find/${event.data.input}`);
}
</script>

<style></style>