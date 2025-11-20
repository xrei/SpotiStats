import {buildKeys, chooseGranularity, getRange} from '../lib/range'
import type {CountAgg, Granularity, TimeIndex} from '../types'
import type {TimeRange} from '@/shared/ui'
import type {Series, XYPoint} from '@/shared/ui/BaseLineChart'

export type AlbumChartMetric = 'plays' | 'hours' | 'albums'
export type AlbumChartSeries = {series: Series[]; granularity: Granularity}

export const AlbumChartMetrics: {label: string; value: AlbumChartMetric}[] = [
  {label: 'Plays', value: 'plays'},
  {label: 'Hours', value: 'hours'},
  {label: 'Albums', value: 'albums'},
]

const keyToTs = (granularity: Granularity, key: string): number =>
  granularity === 'day' ? new Date(key).getTime() : new Date(`${key}-01`).getTime()

const metricLabel = (metric: AlbumChartMetric) => {
  const item = AlbumChartMetrics.find((opt) => opt.value === metric)
  return item ? item.label : metric
}

export const buildAlbumChartSeries = (
  ix: TimeIndex,
  range: TimeRange,
  metric: AlbumChartMetric,
): AlbumChartSeries => {
  const {fromDay, toDay} = getRange(range, ix)
  if (!fromDay || !toDay || fromDay > toDay) {
    return {series: [{name: metricLabel(metric), data: []}], granularity: 'day'}
  }

  const granularity = chooseGranularity(fromDay, toDay)
  const keys = buildKeys(granularity, fromDay, toDay)
  const buckets = granularity === 'day' ? ix.albumsByDay : ix.albumsByMonth

  const points: XYPoint[] = keys.map((key) => {
    const bucket = buckets.get(key)
    if (metric === 'albums')
      return {x: keyToTs(granularity, key), y: bucket ? bucket.size : 0}

    let total = 0
    if (bucket) {
      for (const agg of bucket.values() as Iterable<CountAgg>) {
        total += metric === 'plays' ? agg.plays : agg.ms
      }
    }

    if (metric === 'hours') total = Math.round(total / 3_600_000)

    return {x: keyToTs(granularity, key), y: total}
  })

  return {
    series: [{name: metricLabel(metric), data: points}],
    granularity,
  }
}
