import {
  uploadFilesFx,
  $hasPersistedData,
  $uploadProgress,
  filesSelected,
} from '@/features/Magic/dataLoader'

// Redirect when data exists (either already persisted or just uploaded)
const $shouldRedirect = $hasPersistedData

export const mainPageModel = {
  filesSelected,
  $uploadProgress,
  $shouldRedirect,
  uploadPending: uploadFilesFx.pending,
}
