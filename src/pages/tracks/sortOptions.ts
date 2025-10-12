import type {SortOption} from '@/features/filters'
import {TrackSort} from '@/features/magic'
import type {TrackSort as TrackSortType} from '@/features/magic'

export const TrackSortOpts: readonly SortOption<TrackSortType>[] = [
  {label: 'Range Time', value: TrackSort.RangeMs},
  {label: 'Range Plays', value: TrackSort.RangePlays},
  {label: 'Lifetime Time', value: TrackSort.LifetimeMs},
  {label: 'Lifetime Plays', value: TrackSort.LifetimePlays},
  {label: 'Name', value: TrackSort.Name},
]
