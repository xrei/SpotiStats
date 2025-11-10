import type {SortOption} from '@/features/Filters'
import {ArtistSort} from '@/features/Magic'
import type {ArtistSort as ArtistSortType} from '@/features/Magic'

export const ArtistSortOpts: readonly SortOption<ArtistSortType>[] = [
  {label: 'Range Plays', value: ArtistSort.RangePlays},
  {label: 'Range Time', value: ArtistSort.RangeMs},
  {label: 'Lifetime Time', value: ArtistSort.LifetimeMs},
  {label: 'Name', value: ArtistSort.Name},
]
