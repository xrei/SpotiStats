import type {SortOption} from '@/features/filters'
import {ArtistSort} from '@/features/magic'
import type {ArtistSort as ArtistSortType} from '@/features/magic'

export const ArtistSortOpts: readonly SortOption<ArtistSortType>[] = [
  {label: 'Range Plays', value: ArtistSort.RangePlays},
  {label: 'Range Time', value: ArtistSort.RangeMs},
  {label: 'Lifetime Time', value: ArtistSort.LifetimeMs},
  {label: 'Name', value: ArtistSort.Name},
]
