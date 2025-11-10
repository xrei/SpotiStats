import type {ArtistListItem, ArtistTree} from '../types'
import type {SelectSchema} from './select'
import {numberDesc, stringAsc, applyOrder, composeComparators} from './sort'

export const ArtistSort = {
  RangePlays: 'rangePlays',
  RangeMs: 'rangeMs',
  LifetimeMs: 'lifetimeMs',
  Name: 'name',
} as const

export type ArtistSort = (typeof ArtistSort)[keyof typeof ArtistSort]

export const artistView: SelectSchema<ArtistTree, ArtistListItem> = {
  from: (ix, granularity) => (granularity === 'day' ? ix.artistsByDay : ix.artistsByMonth),

  project: (id, dt, agg, granularity): ArtistListItem | null => {
    const a = dt[id]
    if (!a) return null
    return {
      id,
      name: id,
      lifetime: {
        uniqueTracks: a.uniqueTracksCount,
        uniqueAlbums: a.uniqueAlbumsCount,
        plays: a.playsCount,
        ms: a.playTimeMs,
        firstTs: a.firstTs,
        lastTs: a.lastTs,
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

  whereText: (r) => r.name,

  order: (rs, {order, by}) => {
    const key = (by as ArtistSort) ?? ArtistSort.RangeMs

    const comparators: Record<ArtistSort, (a: ArtistListItem, b: ArtistListItem) => number> = {
      [ArtistSort.RangeMs]: numberDesc((row) => row.range?.ms),
      [ArtistSort.RangePlays]: numberDesc((row) => row.range?.plays),
      [ArtistSort.LifetimeMs]: numberDesc((row) => row.lifetime?.ms),
      [ArtistSort.Name]: stringAsc((row) => row.name),
    }

    const primary = comparators[key]
    const fallback = stringAsc((row: ArtistListItem) => row.name)

    rs.sort(composeComparators([applyOrder(primary, order), applyOrder(fallback, order)]))
  },
} as const
