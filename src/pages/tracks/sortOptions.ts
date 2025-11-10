import type {SortOption} from '@/features/Filters'
import {TrackSort} from '@/features/Magic'
import type {TrackSort as TrackSortType} from '@/features/Magic'

export const TrackSortOpts: readonly SortOption<TrackSortType>[] = [
  {label: 'Range Time', value: TrackSort.RangeMs},
  {label: 'Range Plays', value: TrackSort.RangePlays},
  {label: 'Lifetime Time', value: TrackSort.LifetimeMs},
  {label: 'Lifetime Plays', value: TrackSort.LifetimePlays},
  {label: 'Name', value: TrackSort.Name},
]
