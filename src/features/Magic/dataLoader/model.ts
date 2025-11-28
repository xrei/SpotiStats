import {createEffect, createEvent, createStore, sample} from 'effector'
import type {StreamingEntry} from '../data/entry'
import {validateBatch} from '../data/validation'
import {indexedDBService} from '@/shared/lib/indexedDB'
import type {UploadProgress, UploadResult} from './types'

export const filesSelected = createEvent<File[]>('files selected')
export const clearData = createEvent<void>('clear data')

const uploadProgressUpdated = createEvent<UploadProgress>('upload progress updated')

export const $hasPersistedData = createStore<boolean>(false, {
  name: 'has persisted data',
})

export const $uploadProgress = createStore<UploadProgress>(
  {
    status: 'idle',
    filesProcessed: 0,
    totalFiles: 0,
    validEntries: 0,
    invalidEntries: 0,
    errorMessage: null,
  },
  {name: 'upload progress'},
)

$uploadProgress.on(uploadProgressUpdated, (_, progress) => progress)

const saveToIndexedDBFx = createEffect<StreamingEntry[], void>(
  async (entries: StreamingEntry[]) => {
    await indexedDBService.clearAllData()
    await indexedDBService.saveEntries(entries)
    await indexedDBService.setMetadata({
      uploadedAt: new Date().toISOString(),
      totalEntries: entries.length,
    })
  },
)

export const uploadFilesFx = createEffect<File[], UploadResult>(async (files: File[]) => {
  let totalValid = 0
  let totalInvalid = 0
  const allEntries: StreamingEntry[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    uploadProgressUpdated({
      status: 'uploading',
      filesProcessed: i,
      totalFiles: files.length,
      validEntries: totalValid,
      invalidEntries: totalInvalid,
      errorMessage: null,
    })

    const content = await file.text()
    let parsed: unknown

    try {
      parsed = JSON.parse(content)
    } catch (error) {
      throw new Error(`Failed to parse ${file.name}: Invalid JSON`)
    }

    if (!Array.isArray(parsed)) {
      throw new Error(`${file.name} does not contain an array`)
    }

    uploadProgressUpdated({
      status: 'validating',
      filesProcessed: i + 1,
      totalFiles: files.length,
      validEntries: totalValid,
      invalidEntries: totalInvalid,
      errorMessage: null,
    })

    const result = validateBatch(parsed)
    allEntries.push(...result.valid)
    totalValid += result.valid.length
    totalInvalid += result.invalid
  }

  if (totalValid === 0) {
    throw new Error('No valid entries found. Please check your Spotify data files.')
  }

  return {
    validEntries: totalValid,
    invalidEntries: totalInvalid,
    totalFiles: files.length,
    entries: allEntries,
  }
})

sample({
  clock: uploadFilesFx.doneData,
  fn: (result) => result.entries,
  target: saveToIndexedDBFx,
})

export const loadPersistedDataFx = createEffect<void, StreamingEntry[][]>(async () => {
  if (!indexedDBService.isSupported()) {
    return []
  }

  const hasData = await indexedDBService.hasData()
  if (!hasData) return []

  const entries = await indexedDBService.loadAllEntries()
  return [entries]
})

export const clearPersistedDataFx = createEffect<void, void>(async () => {
  await indexedDBService.clearAllData()
})

export const checkPersistedDataFx = createEffect<void, boolean>(async () => {
  if (!indexedDBService.isSupported()) return false
  return indexedDBService.hasData()
})

sample({
  clock: uploadFilesFx.doneData,
  fn: (result) => ({
    status: 'complete' as const,
    filesProcessed: result.totalFiles,
    totalFiles: result.totalFiles,
    validEntries: result.validEntries,
    invalidEntries: result.invalidEntries,
    errorMessage: null,
  }),
  target: $uploadProgress,
})

sample({
  clock: uploadFilesFx.doneData,
  fn: () => true,
  target: $hasPersistedData,
})

sample({
  clock: uploadFilesFx.fail,
  fn: ({error}: {error: Error}) => ({
    status: 'error' as const,
    filesProcessed: 0,
    totalFiles: 0,
    validEntries: 0,
    invalidEntries: 0,
    errorMessage: error.message,
  }),
  target: $uploadProgress,
})

sample({
  clock: filesSelected,
  target: uploadFilesFx,
})

sample({
  clock: clearData,
  target: clearPersistedDataFx,
})

sample({
  clock: clearPersistedDataFx.done,
  fn: () => false,
  target: $hasPersistedData,
})

// Reset upload progress when data is cleared
$uploadProgress.reset(clearPersistedDataFx.done)

sample({
  clock: checkPersistedDataFx.doneData,
  target: $hasPersistedData,
})
