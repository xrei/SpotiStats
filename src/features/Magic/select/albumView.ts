import type {AlbumListItem, AlbumTree} from '../types'
import type {SelectSchema} from './select'
import {numberDesc, stringAsc, applyOrder, composeComparators} from './sort'

export const AlbumSort = {
  RangePlays: 'rangePlays',
  RangeMs: 'rangeMs',
  LifetimeMs: 'lifetimeMs',
  LifetimeTracks: 'lifetimeTracks',
  Name: 'name',
} as const

export type AlbumSort = (typeof AlbumSort)[keyof typeof AlbumSort]

export const albumView: SelectSchema<AlbumTree, AlbumListItem> = {
  from: (ix, granularity) => (granularity === 'day' ? ix.albumsByDay : ix.albumsByMonth),

  project: (id, data, agg, granularity) => {
    const album = data[id]
    if (!album) return null

    return {
      id,
      name: album.name,
      artistName: album.artistName,
      lifetime: {
        uniqueTracks: album.uniqueTracksCount,
        plays: album.playsCount,
        ms: album.playTimeMs,
        firstTs: album.firstTs,
        lastTs: album.lastTs,
      },
      range: {
        ms: agg.ms,
        plays: agg.plays,
        firstKey: agg.firstKey,
        lastKey: agg.lastKey,
        granularity,
      },
    }
  },

  whereText: (row) => `${row.artistName} ${row.name}`,

  order: (rows, {order, by}) => {
    const sortKey = (by as AlbumSort) ?? AlbumSort.RangeMs
    const key = (row: AlbumListItem) => `${row.artistName}::${row.name}`

    const comparators: Record<AlbumSort, (a: AlbumListItem, b: AlbumListItem) => number> = {
      [AlbumSort.RangeMs]: numberDesc((row) => row.range?.ms),
      [AlbumSort.RangePlays]: numberDesc((row) => row.range?.plays),
      [AlbumSort.LifetimeMs]: numberDesc((row) => row.lifetime?.ms),
      [AlbumSort.LifetimeTracks]: numberDesc((row) => row.lifetime?.uniqueTracks),
      [AlbumSort.Name]: stringAsc(key),
    }

    const primary = comparators[sortKey]
    const fallback = stringAsc(key)

    rows.sort(composeComparators([applyOrder(primary, order), applyOrder(fallback, order)]))
  },
} as const
