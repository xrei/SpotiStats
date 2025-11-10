import {useUnit} from 'effector-solid'
import {Show, type Component} from 'solid-js'
import {PeakChart, PeakTimelineChart} from './ui'
import type {PeakActivityWidgetProps} from './types'
import clsx from 'clsx'

export const PeakActivityWidget: Component<PeakActivityWidgetProps> = (props) => {
  const peakData = useUnit(props.model.$peakActivity)

  return (
    <div class={clsx('peaks', props.className)}>
      <Show when={peakData()} fallback={<EmptyState />}>
        {(data) => (
          <>
            <div class="">
              <h2 class="text-text-strong text-xl font-semibold">Peak Activity</h2>
              <Show when={data().primary}>
                {(primary) => (
                  <div class="mt-1">
                    <span class="text-text-strong font-semibold">{primary().label}</span>
                    <span class="text-text-muted ml-3 text-sm">
                      {primary().plays.toLocaleString()} plays ·{' '}
                      {primary().hours.toFixed(1)}h
                    </span>
                  </div>
                )}
              </Show>
            </div>

            <div class="mb-4">
              <PeakTimelineChart peaks={data()} />
            </div>

            <PeakChart peaks={data()} />
          </>
        )}
      </Show>
    </div>
  )
}

const EmptyState: Component = () => {
  return (
    <div class="text-text-muted py-8 text-center">No peak activity data available</div>
  )
}
