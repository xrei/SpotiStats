export type UploadStatus =
  | 'idle'
  | 'uploading'
  | 'validating'
  | 'persisting'
  | 'complete'
  | 'error'

export type UploadProgress = {
  status: UploadStatus
  filesProcessed: number
  totalFiles: number
  validEntries: number
  invalidEntries: number
  errorMessage: string | null
}

import type {StreamingEntry} from '../data/entry'

export type UploadResult = {
  validEntries: number
  invalidEntries: number
  totalFiles: number
  entries: StreamingEntry[]
}

export type ValidationStats = {
  valid: number
  invalid: number
}
