import type {Accessor, JSX} from 'solid-js'
import type {TimeRange} from '@/shared/ui'
import type {FiltersModel} from '@/features/Filters'

export type ColumnContext<Sort extends string = string> = {
  filtersModel: FiltersModel<Sort>
  timeRange: Accessor<TimeRange>
}

export type EntityExplorerColumn<Item, Sort extends string = string> = {
  key: string
  width?: string
  align?: 'left' | 'center' | 'right'
  header?: string | ((ctx: ColumnContext<Sort>) => JSX.Element)
  cellClass?: string
  visible?: (ctx: ColumnContext<Sort>) => boolean
  render: (item: Item, ctx: ColumnContext<Sort>) => JSX.Element
}

export type PrimaryHeaderRenderer = (count: number) => JSX.Element
