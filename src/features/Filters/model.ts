import {combine, createEvent, createStore, sample} from 'effector'
import type {TimeRange} from '@/shared/ui'
import type {Order} from './types'

export type SortOption<Sort extends string> = {label: string; value: Sort}

export type FiltersState<Sort extends string> = {
  search: string
  timeRange: TimeRange
  sort: {
    by: Sort
    order: Order
  }
}

export type FiltersModelConfig<Sort extends string> = {
  sortOptions: readonly SortOption<Sort>[]
  defaultSort?: Sort
  defaultOrder?: Order
  defaultTimeRange?: TimeRange
  defaultSearch?: string
}

const defaultTimeRange: TimeRange = {kind: 'fixed', value: 'All'}

export const createFiltersModel = <Sort extends string>(
  config: FiltersModelConfig<Sort>,
) => {
  const sortOptions = config.sortOptions
  const defaultSort = config.defaultSort ?? sortOptions[0]?.value
  if (!defaultSort)
    throw new Error('createFiltersModel requires at least one sort option')

  // --- Search
  const $search = createStore(config.defaultSearch ?? '')
  const searchChanged = createEvent<string>()

  sample({
    clock: searchChanged,
    target: $search,
  })
  // ----

  // --- TimeRange
  const $timeRange = createStore<TimeRange>(config.defaultTimeRange ?? defaultTimeRange)
  const timeRangeChanged = createEvent<TimeRange>()

  sample({
    clock: timeRangeChanged,
    target: $timeRange,
  })
  // ----

  // --- Sort | Order
  const $sortBy = createStore<Sort>(defaultSort)
  const sortByChanged = createEvent<Sort>()
  const $order = createStore<Order>(config.defaultOrder ?? 'desc')
  const orderChanged = createEvent<Order>()

  const $sort = combine({by: $sortBy, order: $order})

  sample({
    clock: sortByChanged,
    target: $sortBy,
  })

  sample({
    clock: orderChanged,
    target: $order,
  })
  // ----

  const $filters = combine({
    search: $search,
    timeRange: $timeRange,
    sort: $sort,
  })

  return {
    sortOptions,
    $filters,
    Sort: {
      $sortBy,
      sortByChanged,
      $order,
      orderChanged,
    },
    Search: {
      $search,
      searchChanged,
    },
    TimeRange: {
      $timeRange,
      timeRangeChanged,
    },
  }
}

export type FiltersModel<Sort extends string> = ReturnType<
  typeof createFiltersModel<Sort>
>
