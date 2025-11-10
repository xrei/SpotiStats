import {buildKeys, chooseGranularity, getRange} from '../lib/range'
import type {CountAgg, Granularity, TimeIndex} from '../types'
import type {TimeRange} from '@/shared/ui'
import type {Series, XYPoint} from '@/shared/ui/BaseLineChart'

export type ArtistChartSeries = {series: Series[]; granularity: Granularity}
export type ArtistChartMetric = 'plays' | 'hours' | 'artists'

export const ArtistChartMetrics: {label: string; value: ArtistChartMetric}[] = [
  {label: 'Plays', value: 'plays'},
  {label: 'Hours', value: 'hours'},
  {label: 'Artists', value: 'artists'},
]

const keyToTs = (gran: Granularity, key: string): number =>
  gran === 'day' ? new Date(key).getTime() : new Date(`${key}-01`).getTime()

const metricLabel = (m: ArtistChartMetric) => {
  const item = ArtistChartMetrics.find((i) => i.value === m)
  return item ? item.label : m
}

export function buildArtistChartSeries(
  ix: TimeIndex,
  range: TimeRange,
  metric: ArtistChartMetric,
): ArtistChartSeries {
  const {fromDay, toDay} = getRange(range, ix)
  if (!fromDay || !toDay || fromDay > toDay) {
    return {series: [{name: metricLabel(metric), data: []}], granularity: 'day'}
  }

  const gran = chooseGranularity(fromDay, toDay)
  const keys = buildKeys(gran, fromDay, toDay)
  const src = gran === 'day' ? ix.artistsByDay : ix.artistsByMonth

  const points: XYPoint[] = keys.map((k) => {
    const bucket = src.get(k)

    if (metric === 'artists') return {x: keyToTs(gran, k), y: bucket ? bucket.size : 0}

    let sum = 0
    if (bucket) {
      for (const agg of bucket.values() as Iterable<CountAgg>) {
        sum += metric === 'plays' ? agg.plays : agg.ms
      }
    }
    if (metric === 'hours') sum = Math.round(sum / 3_600_000)

    return {x: keyToTs(gran, k), y: sum}
  })

  return {
    series: [{name: metricLabel(metric), data: points}],
    granularity: gran,
  }
}
