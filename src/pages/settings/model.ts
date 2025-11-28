import {createEffect, createStore, sample} from 'effector'
import {createGate} from 'effector-solid'
import {indexedDBService, type StorageStats} from '@/shared/lib/indexedDB'
import {clearData, clearPersistedDataFx} from '@/features/Magic/dataLoader'
import {toastAdded} from '@/shared/ui/Toast'

export const SettingsPageGate = createGate('SettingsPageGate')

const loadStatsFx = createEffect<void, StorageStats>(async () => {
  return indexedDBService.getStats()
})

export const $storageStats = createStore<StorageStats | null>(null, {
  name: 'storage stats',
})

sample({
  clock: SettingsPageGate.open,
  target: loadStatsFx,
})

sample({
  clock: loadStatsFx.doneData,
  target: $storageStats,
})

sample({
  clock: SettingsPageGate.close,
  target: $storageStats.reinit,
})

// loadStatsFx - show toast on failure
sample({
  clock: loadStatsFx.fail,
  fn: () => ({message: 'Failed to load storage statistics.', type: 'error' as const}),
  target: toastAdded,
})

// loadStatsFx - set null on failure
sample({
  clock: loadStatsFx.fail,
  fn: () => null,
  target: $storageStats,
})

export {clearData, clearPersistedDataFx}
