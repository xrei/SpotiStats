import {combine, createStore, sample} from 'effector'
import type {Store} from 'effector'
import type {Gate} from 'effector-solid'
import {createFiltersModel, type FiltersModel, type FiltersModelConfig} from '@/features/Filters'
import type {TimeIndex} from '@/features/Magic'
import type {SelectContext} from '@/features/Magic/select'

export type EntityExplorerModelConfig<
  Sort extends string = string,
  Data = unknown,
  Item = unknown,
> = FiltersModelConfig<Sort> & {
  gate: Gate<unknown>
  sources: {
    data: Store<Data>
    timeIndex: Store<TimeIndex>
  }
  select: (params: SelectContext<Data>) => Item[]
}

export const createEntityExplorerModel = <
  Sort extends string = string,
  Data = unknown,
  Item = unknown,
>(
  config: EntityExplorerModelConfig<Sort, Data, Item>,
): EntityExplorerModel<Sort, Item> => {
  const filtersModel = createFiltersModel<Sort>({
    sortOptions: config.sortOptions,
    defaultSort: config.defaultSort,
    defaultOrder: config.defaultOrder,
    defaultTimeRange: config.defaultTimeRange,
    defaultSearch: config.defaultSearch,
  })
  const $items = createStore<Item[]>([])

  const combined = combine({
    opened: config.gate.status,
    filters: filtersModel.$filters,
    data: config.sources.data,
    timeIndex: config.sources.timeIndex,
  })

  sample({
    clock: combined,
    filter: ({opened}) => opened,
    fn: ({filters, data, timeIndex}) =>
      config.select({
        from: timeIndex,
        join: data,
        where: filters,
      }),
    target: $items,
  })

  $items.reset(config.gate.close)

  return {
    filtersModel,
    $items,
  }
}

export type EntityExplorerModel<Sort extends string = string, Item = unknown> = {
  filtersModel: FiltersModel<Sort>
  $items: Store<Item[]>
}
