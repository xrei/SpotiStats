import {createEvent, sample} from 'effector'
import {
  uploadFilesFx,
  uploadCompleted,
  $hasPersistedData,
  $uploadProgress,
  filesSelected,
} from '@/features/Magic/dataLoader'

const pageOpened = createEvent<void>('main page opened')
const showStatsClicked = createEvent<void>('show stats clicked')

sample({
  clock: uploadFilesFx.doneData,
  target: uploadCompleted,
})

sample({
  clock: pageOpened,
  source: $hasPersistedData,
  filter: (hasData) => hasData,
  target: showStatsClicked,
})

export const mainPageModel = {
  pageOpened,
  showStatsClicked,
  filesSelected,
  $uploadProgress,
  $hasPersistedData,
  uploadPending: uploadFilesFx.pending,
}
