<template>
  <AppHeader />
  <div class="min-w-64 w-1/2 md:w-1/3 mx-auto">
    <UForm ref="form" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormGroup name="selectPaths" label="Path">
        <USelectMenu searchable searchable-placeholder="Search a person..." class="w-full lg:w-48"
          placeholder="Select a Path" :options="options" v-model="state.path" :search-attributes="['id']">
          <template #label>
            <span v-if="state.path" class="truncate">{{ state.path.emoji + " - " + state.path.value }}</span>
            <span v-else>Select people</span>
          </template>
          <template #option="{ option: path }">
            <span class="truncate">{{ path.emoji + " - " + path.value }}</span>
          </template>
        </USelectMenu>
      </UFormGroup>

      <UFormGroup name="title" label="Title">
        <UInput v-model="state.title" />
      </UFormGroup>

      <UFormGroup name="content" label="Content">
        <UTextarea v-model="state.content" />
      </UFormGroup>

      <UFormGroup name="file" label="File">
        <UInput type="file" size="sm" @change="handleFileUpload($event)" />
      </UFormGroup>

      <UFormGroup name="selectMenuTimeToLive" label="Select TimeToLive option">
        <USelectMenu v-model="state.ttl" placeholder="Select..." :options="ttlOptions" icon="i-heroicons-clock" />
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
import { TttEnum, type Clip } from '~/models/clip.model';
import type { Path } from '~/models/path.model';
import type { OptionPath } from '~/models/option.model';

const { data: paths, error } = await useFetch('http://localhost:7071/api/paths/get/available', {
  method: 'GET',
  transform: (data: Path[]) => data.map((path: Path) => ({ value: path.id, label: path.id, emoji: path.emoji } as OptionPath))
});

// TODO : handle error

const options = paths.value as OptionPath[];

const ttlOptions = [
  { label: '1 Hour', value: TttEnum.OneHour },
  { label: '6 Hour', value: TttEnum.SixHours },
  { label: '12 Hour', value: TttEnum.TwelveHours },
  { label: '24 Hour', value: TttEnum.TwentyFourHours }
]

const state = reactive({
  path: options ? options[0] : undefined,
  title: "",
  content: "",
  file: new File([""], "test"),
  ttl: ttlOptions[0],
})

const schema = z.object({
  path: z.any(),
  title: z.string().min(1),
  content: z.string().min(1),
  file: z.any(),
  ttl: z.any(),
})

type Schema = z.infer<typeof schema>

const form = ref();
let submitError = ref();

const file = ref<File | null>(null);

async function handleFileUpload(event: Event) {
  const [_file] = (event.target as HTMLInputElement).files as FileList;
  file.value = _file;
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log("submit")
  console.log(event.data.file)

  if (!file.value) return;

  // renaming the file as the clip path
  const fileExtension = file.value.name.split('.')[1];
  const fileName = `${event.data.path.value}.${fileExtension}`;

  const formData = new FormData();
  formData.append('file', file.value, fileName);
  formData.append('ttl', event.data.ttl.value);

  // TODO : Refactor
  try {
    const response = await fetch('http://localhost:7071/api/clip/upload/file', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);

    const clip: Clip = {
      path: event.data.path.value,
      title: event.data.title,
      content: event.data.content,
      file: data.file,
      file_extension: fileExtension,
      ttl: TttEnum.TwentyFourHours,
    };

    const { data: newClip, error: submitError } = await useFetch<Clip>('http://localhost:7071/api/clip/add', {
      method: 'POST',
      body: JSON.stringify(clip),
    });


    // redirect to path
    if (newClip.value) await navigateTo(`/find/${newClip.value.path}`);


    console.log(newClip);
  } catch (error) {
    console.error('There was a problem with the fetch operation: ', error);
  }


}
</script>

<style></style>