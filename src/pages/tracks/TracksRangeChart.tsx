import {Show} from 'solid-js'
import {useUnit} from 'effector-solid'
import {BaseLineChart} from '@/shared/ui/BaseLineChart'
import * as pageModel from './model'

export const TracksRangeChart = () => {
  const data = useUnit(pageModel.$chartData)

  return (
    <div class="bg-surface-1/10 flex min-h-0 flex-1 flex-col rounded-xl p-4">
      <div class="flex items-center justify-between">
        <span class="text-text-muted text-sm">Show: Tracks</span>
      </div>
      <div class="flex-1">
        <Show
          when={data().series.length !== 0}
          fallback={<div class="flex h-full items-center justify-center">No data</div>}
        >
          <BaseLineChart series={data().series} />
        </Show>
      </div>
    </div>
  )
}
