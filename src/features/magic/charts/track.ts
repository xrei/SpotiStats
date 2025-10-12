import {buildKeys, chooseGranularity, getRange} from '../lib/range'
import type {Granularity, TimeIndex} from '../types'
import type {TimeRange} from '@/shared/ui'
import type {Series, XYPoint} from '@/shared/ui/BaseLineChart'

export type TrackChartSeries = {series: Series[]; granularity: Granularity}

const keyToTs = (granularity: Granularity, key: string): number =>
  granularity === 'day' ? new Date(key).getTime() : new Date(`${key}-01`).getTime()

export const buildTrackChartSeries = (
  ix: TimeIndex,
  range: TimeRange,
): TrackChartSeries => {
  const {fromDay, toDay} = getRange(range, ix)
  if (!fromDay || !toDay || fromDay > toDay) {
    return {series: [{name: 'Tracks', data: []}], granularity: 'day'}
  }

  const granularity = chooseGranularity(fromDay, toDay)
  const keys = buildKeys(granularity, fromDay, toDay)
  const buckets = granularity === 'day' ? ix.tracksByDay : ix.tracksByMonth

  const points: XYPoint[] = keys.map((key) => {
    const bucket = buckets.get(key)
    return {x: keyToTs(granularity, key), y: bucket ? bucket.size : 0}
  })

  return {
    series: [{name: 'Tracks', data: points}],
    granularity,
  }
}
