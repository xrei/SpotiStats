import {combine, createEffect, createEvent, createStore, sample} from 'effector'
import type {StreamingEntry} from '../data/entry'
import {validateBatch} from '../data/validation'
import {indexedDBService, QuotaExceededError} from '@/shared/lib/indexedDB'
import {toastAdded} from '@/shared/ui/Toast'
import type {UploadProgress, UploadResult} from './types'

// Event to reset in-memory history (exported for model.ts to use)
export const resetHistory = createEvent<void>('reset history')

const STORAGE_KEY = 'spotistats:hasData'

// Synchronous check for initial render (no flicker)
// Returns true if user previously had data, false otherwise
export const getInitialHasDataSync = (): boolean => {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

const setHasDataSync = (value: boolean) => {
  if (typeof window === 'undefined') return
  try {
    if (value) {
      localStorage.setItem(STORAGE_KEY, 'true')
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Ignore localStorage errors
  }
}

export const filesSelected = createEvent<File[]>('files selected')
export const clearData = createEvent<void>('clear data')

const uploadProgressUpdated = createEvent<UploadProgress>('upload progress updated')

// Whether data is persisted in IndexedDB (for next session)
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

export const saveToIndexedDBFx = createEffect<StreamingEntry[], void>(
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

// When upload completes: trigger background save (non-blocking)
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

// Upload complete → status 'complete' IMMEDIATELY (don't wait for save)
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

// Save to IndexedDB done → mark as persisted (for next session)
sample({
  clock: saveToIndexedDBFx.done,
  fn: () => true,
  target: $hasPersistedData,
})

// Upload failed → show error status
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

// NOTE: saveToIndexedDBFx.fail does NOT set status to error
// User can still use the app, data just won't persist to next session

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

// Reset in-memory history when persisted data is cleared
// This triggers layout redirect to / via $hasData becoming false
sample({
  clock: clearPersistedDataFx.done,
  target: resetHistory,
})

// Reset upload progress when data is cleared
$uploadProgress.reset(clearPersistedDataFx.done)

sample({
  clock: checkPersistedDataFx.doneData,
  target: $hasPersistedData,
})

sample({
  clock: checkPersistedDataFx.doneData,
  filter: (hasData) => hasData,
  target: loadPersistedDataFx,
})

// Error handlers for effects

// saveToIndexedDBFx - show toast on save failure (background, non-blocking)
sample({
  clock: saveToIndexedDBFx.fail,
  fn: ({error}) => {
    console.error('IndexedDB save failed:', error)
    return {
      message:
        error instanceof QuotaExceededError
          ? `${error.message} Your data won't be saved for next visit.`
          : "Failed to save data. Your data won't persist after closing the browser.",
      type: 'error' as const,
    }
  },
  target: toastAdded,
})

// loadPersistedDataFx - show toast
sample({
  clock: loadPersistedDataFx.fail,
  fn: () => ({message: 'Failed to load your data.', type: 'error' as const}),
  target: toastAdded,
})

// loadPersistedDataFx - reset state
sample({
  clock: loadPersistedDataFx.fail,
  fn: () => false,
  target: $hasPersistedData,
})

// clearPersistedDataFx - show toast on clear failure
sample({
  clock: clearPersistedDataFx.fail,
  fn: () => ({
    message: 'Failed to clear data. Please try again.',
    type: 'error' as const,
  }),
  target: toastAdded,
})

// checkPersistedDataFx - silent failure, default to false
sample({
  clock: checkPersistedDataFx.fail,
  fn: () => false,
  target: $hasPersistedData,
})

// Combined loading state: true while checking OR loading persisted data
// Used by UI to show "Loading..." instead of upload form
export const $isLoadingPersistedData = combine(
  checkPersistedDataFx.pending,
  loadPersistedDataFx.pending,
  (checking, loading) => checking || loading,
)

// Whether data is being saved to IndexedDB
// Used to prevent page close/refresh during save
export const $isSavingToStorage = saveToIndexedDBFx.pending

// Whether the initial persistence check has completed
// Starts false, becomes true after checkPersistedDataFx finishes (success or fail)
// Used to prevent premature redirects before we know if user has data
export const $isInitialized = createStore(false, {name: 'is initialized'})

sample({
  clock: [checkPersistedDataFx.done, checkPersistedDataFx.fail],
  fn: () => true,
  target: $isInitialized,
})

// Sync localStorage ONLY on explicit save/clear (not on store init or check)
// This prevents clearing localStorage on app startup before we read it
sample({
  clock: saveToIndexedDBFx.done,
  fn: () => {
    setHasDataSync(true)
  },
})

sample({
  clock: clearPersistedDataFx.done,
  fn: () => {
    setHasDataSync(false)
  },
})
