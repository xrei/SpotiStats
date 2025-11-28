import {routes} from '@/pages'
import {Router} from '@solidjs/router'
import {AppLayout} from './layout'
import {onMount} from 'solid-js'
import {checkPersistedDataFx, loadPersistedDataFx} from '@/features/Magic/dataLoader'
import {sample} from 'effector'

sample({
  clock: checkPersistedDataFx.doneData,
  filter: (hasData) => hasData,
  target: loadPersistedDataFx,
})

export const App = () => {
  onMount(() => {
    checkPersistedDataFx()
  })

  return (
    <>
      <Router root={AppLayout}>{routes}</Router>
    </>
  )
}
