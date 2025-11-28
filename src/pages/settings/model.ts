import {createEffect, createStore, sample} from 'effector'
import {createGate} from 'effector-solid'
import {indexedDBService, type StorageStats} from '@/shared/lib/indexedDB'
import {clearData, clearPersistedDataFx} from '@/features/Magic/dataLoader'

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

export {clearData, clearPersistedDataFx}
