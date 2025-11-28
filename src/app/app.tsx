import {routes} from '@/pages'
import {Router} from '@solidjs/router'
import {AppLayout} from './layout'
import {onCleanup, onMount} from 'solid-js'
import {useUnit} from 'effector-solid'
import {checkPersistedDataFx, loadPersistedDataFx, $isSavingToStorage} from '@/features/Magic/dataLoader'
import {sample} from 'effector'
import {AppErrorBoundary, ToastContainer} from '@/shared/ui'

sample({
  clock: checkPersistedDataFx.doneData,
  filter: (hasData) => hasData,
  target: loadPersistedDataFx,
})

export const App = () => {
  const isSaving = useUnit($isSavingToStorage)

  // Prevent page close/refresh while data is being saved to IndexedDB
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isSaving()) {
      e.preventDefault()
      return (e.returnValue = 'Data is being saved. Are you sure you want to leave?')
    }
  }

  onMount(() => {
    checkPersistedDataFx()
    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  onCleanup(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  return (
    <AppErrorBoundary>
      <Router root={AppLayout}>{routes}</Router>
      <ToastContainer />
    </AppErrorBoundary>
  )
}
