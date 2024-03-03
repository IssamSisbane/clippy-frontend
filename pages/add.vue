<template>
  <AppHeader />
  <div v-if="fetchPathError" class="mt-4">
    <UAlert
      icon="i-heroicons-exclamation-triangle-solid"
      color="red"
      variant="solid"
      title="Error"
      :description="fetchPathError"
    />
  </div>
  <div class="min-w-64 w-1/2 md:w-1/3 mx-auto" v-else>
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
        <UInput v-model="state.title" :required="true" />
      </UFormGroup>

      <UFormGroup name="content" label="Content">
        <UTextarea v-model="state.content" :required="true" />
      </UFormGroup>

      <UFormGroup name="file" label="File">
        <UInput type="file" size="sm" @change="onFileUpload($event)" accept="image/*" />
      </UFormGroup>

      <UFormGroup name="selectMenuTimeToLive" label="TimeToLive">
        <USelectMenu v-model="state.ttl" placeholder="Select..." :options="ttlOptions" icon="i-heroicons-clock" />
      </UFormGroup>

      <div class="flex justify-center">
        <UButton type="submit" variant="soft">
          Submit
        </UButton>
      </div>
    </UForm>
  </div>
  <div v-if="submitError" class="mt-4">
    <UAlert
      icon="i-heroicons-exclamation-triangle-solid"
      color="red"
      variant="solid"
      title="Error"
      :description="submitError"
    />
  </div>
</template>

<script lang="ts" setup>
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import { TttEnum, type Clip } from '~/models/clip.model';
import type { Path } from '~/models/path.model';
import type { OptionPath } from '~/models/option.model';
import type { FileMetadata } from '~/models/fileInfo.model';

const config = useRuntimeConfig();
const baseApiUrl = config.public.baseApiUrl;

// global page error
let submitError = ref();

const { data: paths, error: fetchPathError } = await useFetch(`${baseApiUrl}/api/paths/get/available`, {
  method: 'GET',
  transform: (data: Path[]) => data.map((path: Path) => ({ value: path.id, label: path.id, emoji: path.emoji } as OptionPath))
});

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
  ttl: ttlOptions[0],
})

const schema = z.object({
  path: z.any(),
  title: z.string().min(1),
  content: z.any(),
  ttl: z.any(),
})
type Schema = z.infer<typeof schema>

const form = ref();
const file = ref<File | null>(null);

async function onFileUpload(event: Event) {
  const [_file] = (event.target as HTMLInputElement).files as FileList;
  if (_file.type.includes('image')) {
    file.value = _file;
    console.log(_file);
    submitError.value = null;
  } else {
    file.value = null;
    submitError.value = `Please provide an image file.`;
  }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const fileMetadata : FileMetadata | undefined = file.value ? await uploadFile(file.value, event.data.path.value, event.data.ttl.value) : undefined;
  
  const clip: Clip = {
    path: event.data.path.value,
    title: event.data.title,
    content: event.data.content,
    file: fileMetadata?.url || "",
    file_extension: fileMetadata?.extension || "",
    ttl: event.data.ttl.value,
  };

  try {
    const newClip: Clip = await $fetch(`${baseApiUrl}/api/clip/add`, {
      method: 'POST',
      body: JSON.stringify(clip)
    });

    // redirect to path
    if (newClip) await navigateTo(`/clip/${newClip.path}`);
  } catch (error) {
    onError('file upload', error);
  } 
}

function onError(event: string, error: any) {
  const message = error instanceof Error ? error.message : "An error occurred";
  submitError.value = `Error during ${event}: ${error.message}`;
  throw new Error(error);
}

async function uploadFile(file: File, path: String, ttl: number) : Promise<FileMetadata> {
  // renaming the file as the clip path
  const fileExtension = file.name.split('.')[1];
  const fileName = `${path}.${fileExtension}`;

  const formData = new FormData();
  formData.append('file', file, fileName);
  formData.append('ttl', ttl.toString());

  try {
    const fileMetadata: FileMetadata = await $fetch(`${baseApiUrl}/api/clip/upload/file`, {
      method: 'POST',
      body: formData,
    });
    return fileMetadata;
  } catch (error) {
    onError('file upload', error);
  }
}
</script>

<style></style>