import type {TrackListItem, EnrichedTrack} from '../types'
import type {SelectSchema} from './select'
import {numberDesc, stringAsc, applyOrder, composeComparators} from './sort'

export const TrackSort = {
  RangePlays: 'rangePlays',
  RangeMs: 'rangeMs',
  LifetimeMs: 'lifetimeMs',
  LifetimePlays: 'lifetimePlays',
  Name: 'name',
} as const

export type TrackSort = (typeof TrackSort)[keyof typeof TrackSort]

export const trackView: SelectSchema<Map<string, EnrichedTrack>, TrackListItem> = {
  from: (ix, granularity) => (granularity === 'day' ? ix.tracksByDay : ix.tracksByMonth),

  project: (id, data, agg, granularity) => {
    const track = data.get(id)
    if (!track) return null

    return {
      id,
      name: track.trackName,
      artistName: track.artistName,
      albumName: track.albumName,
      lifetime: {
        plays: track.playsCount,
        ms: track.totalMs,
        firstTs: track.firstTs,
        lastTs: track.lastTs,
      },
      range: {
        ms: agg.ms,
        plays: agg.plays,
        firstKey: agg.firstKey,
        lastKey: agg.lastKey,
        granularity,
      },
      meta: track.meta,
    }
  },

  whereText: (row) => `${row.name ?? ''} ${row.artistName ?? ''} ${row.albumName ?? ''}`,

  order: (rows, {order, by}) => {
    const sortKey = (by as TrackSort) ?? TrackSort.RangeMs
    const key = (row: TrackListItem) =>
      `${row.artistName ?? ''}::${row.albumName ?? ''}::${row.name ?? ''}`

    const comparators: Record<TrackSort, (a: TrackListItem, b: TrackListItem) => number> =
      {
        [TrackSort.RangeMs]: numberDesc((row) => row.range?.ms),
        [TrackSort.RangePlays]: numberDesc((row) => row.range?.plays),
        [TrackSort.LifetimeMs]: numberDesc((row) => row.lifetime?.ms),
        [TrackSort.LifetimePlays]: numberDesc((row) => row.lifetime?.plays),
        [TrackSort.Name]: stringAsc(key),
      }

    const primary = comparators[sortKey]
    const fallback = stringAsc(key)

    rows.sort(
      composeComparators([applyOrder(primary, order), applyOrder(fallback, order)]),
    )
  },
} as const
