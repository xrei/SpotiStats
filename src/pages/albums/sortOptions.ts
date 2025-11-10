import type {SortOption} from '@/features/Filters'
import {AlbumSort} from '@/features/Magic'
import type {AlbumSort as AlbumSortType} from '@/features/Magic'

export const AlbumSortOpts: readonly SortOption<AlbumSortType>[] = [
  {label: 'Range Plays', value: AlbumSort.RangePlays},
  {label: 'Range Time', value: AlbumSort.RangeMs},
  {label: 'Lifetime Time', value: AlbumSort.LifetimeMs},
  {label: 'Lifetime Tracks', value: AlbumSort.LifetimeTracks},
  {label: 'Name', value: AlbumSort.Name},
]
