import {historyModel} from '@/features/magic'
import {routes} from '@/pages'
import {onMount} from 'solid-js'
import {Router} from '@solidjs/router'
import {AppLayout} from './layout'

export const App = () => {
  onMount(() => {
    historyModel.loadDataFx()
  })

  return (
    <>
      <Router root={AppLayout}>{routes}</Router>
    </>
  )
}
