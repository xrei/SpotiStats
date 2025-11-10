import {type Component, createMemo} from 'solid-js'
import {BaseLineChart, type Series, type XYPoint} from '@/shared/ui/BaseLineChart'
import {dateLib} from '@/shared/lib'
import type {PeakActivity} from '../types'

type Props = {
  peaks: PeakActivity
}

export const PeakTimelineChart: Component<Props> = (props) => {
  const chartSeries = createMemo<Series[]>(() => {
    const dataPoints = props.peaks.timeline.map((point) => ({
      x: dateLib.parseYMD(point.date).getTime(),
      y: point.plays,
    }))

    return [{name: 'Plays', data: dataPoints as XYPoint[]}]
  })

  return (
    <BaseLineChart
      series={chartSeries()}
      height={160}
      class="w-full"
      overrides={{
        stroke: {curve: 'straight', width: 2},
        grid: {
          borderColor: 'var(--color-line-subtle)',
        },
      }}
    />
  )
}
