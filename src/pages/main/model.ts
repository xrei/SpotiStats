import {uploadFilesFx, $uploadProgress, filesSelected, getInitialHasDataSync, $isInitialized} from '@/features/Magic/dataLoader'
import {historyModel} from '@/features/Magic'

// Redirect when data is loaded in memory (not waiting for IndexedDB)
const $shouldRedirect = historyModel.$hasData

// Synchronous initial state - determines what to show before async check completes
// This prevents flicker: if user had data before, show loading; if not, show upload UI
const initialHasData = getInitialHasDataSync()

export const mainPageModel = {
  filesSelected,
  $uploadProgress,
  $shouldRedirect,
  $hasData: historyModel.$hasData,
  $isInitialized,
  uploadPending: uploadFilesFx.pending,
  initialHasData,
}
