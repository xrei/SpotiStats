import type {SortOption} from '@/features/filters'
import {AlbumSort} from '@/features/magic'
import type {AlbumSort as AlbumSortType} from '@/features/magic'

export const AlbumSortOpts: readonly SortOption<AlbumSortType>[] = [
  {label: 'Range Plays', value: AlbumSort.RangePlays},
  {label: 'Range Time', value: AlbumSort.RangeMs},
  {label: 'Lifetime Time', value: AlbumSort.LifetimeMs},
  {label: 'Lifetime Tracks', value: AlbumSort.LifetimeTracks},
  {label: 'Name', value: AlbumSort.Name},
]
