import {A} from '@solidjs/router'
import clsx from 'clsx'
import {For, Show, createMemo, type Accessor, type JSX} from 'solid-js'
import {useUnit} from 'effector-solid'
import {SearchFilter, SortFilter, TimeRangeFilter} from '@/features/Filters'
import {VirtualList} from '@/shared/ui'
import type {EntityExplorerModel} from '../model'
import type {ColumnContext, EntityExplorerColumn, PrimaryHeaderRenderer} from '../types'

const DEFAULT_ROW_HEIGHT = 44
const defaultCountRenderer: PrimaryHeaderRenderer = (count) => (
  <div class="text-text-dim text-left text-sm">Results: {count}</div>
)

type EntityExplorerProps<Item, Sort extends string = string> = {
  model: EntityExplorerModel<Sort, Item>
  columns: readonly EntityExplorerColumn<Item, Sort>[]
  getRowHref?: (item: Item) => string | undefined
  getRowKey?: (item: Item, index: number) => string | number
  searchPlaceholder?: string
  extraFilters?: JSX.Element
  emptyState?: JSX.Element
  renderCount?: PrimaryHeaderRenderer
  estimateSize?: number
}

export const EntityExplorer = <Item, Sort extends string = string>(
  props: EntityExplorerProps<Item, Sort>,
) => {
  const items = useUnit(props.model.$items)
  const timeRange = useUnit(props.model.filtersModel.TimeRange.$timeRange)

  const columnContext: ColumnContext<Sort> = {
    filtersModel: props.model.filtersModel,
    timeRange,
  }

  const visibleColumns = createMemo(() => {
    return props.columns.filter((col) =>
      col.visible ? col.visible(columnContext) : true,
    )
  })

  const normalizeTrack = (width?: string) => {
    if (!width) return 'minmax(0,1fr)'

    const trimmed = width.trim()
    if (
      /^minmax\(/.test(trimmed) ||
      /^fit-content\(/.test(trimmed) ||
      /^clamp\(/.test(trimmed) ||
      trimmed === 'auto' ||
      trimmed === 'min-content' ||
      trimmed === 'max-content'
    ) {
      return trimmed
    }

    if (/fr$/.test(trimmed)) return `minmax(0, ${trimmed})`

    return `minmax(0, ${trimmed})`
  }

  const gridTemplate = createMemo(() => {
    const cols = visibleColumns()
    return cols.length > 0
      ? cols.map((col) => normalizeTrack(col.width)).join(' ')
      : 'minmax(0,1fr)'
  })

  const count = createMemo(() => items().length)
  const renderCount = props.renderCount ?? defaultCountRenderer
  const hasSortOptions = props.model.filtersModel.sortOptions.length > 0

  return (
    <PanelShell>
      <PanelHeader
        model={props.model}
        searchPlaceholder={props.searchPlaceholder}
        extraFilters={props.extraFilters}
        showSort={hasSortOptions}
      />

      <ColumnHeaders
        columns={visibleColumns}
        gridTemplate={gridTemplate}
        columnContext={columnContext}
        renderCount={renderCount}
        count={count}
      />

      <PanelBody
        items={items}
        columns={visibleColumns}
        gridTemplate={gridTemplate}
        columnContext={columnContext}
        getRowHref={props.getRowHref}
        getRowKey={props.getRowKey}
        emptyState={props.emptyState}
        estimateSize={props.estimateSize ?? DEFAULT_ROW_HEIGHT}
      />
    </PanelShell>
  )
}

type PanelShellProps = {children: JSX.Element}

const PanelShell = (props: PanelShellProps) => (
  <section class="stats-cols min-h-0 flex-1">
    <div class="flex h-full flex-col overflow-hidden rounded-xl">{props.children}</div>
  </section>
)

type PanelHeaderProps<Sort extends string = string> = {
  model: EntityExplorerModel<Sort, unknown>
  searchPlaceholder?: string
  extraFilters?: JSX.Element
  showSort: boolean
}

const PanelHeader = <S extends string = string>(props: PanelHeaderProps<S>) => (
  <header class="bg-surface-1 shadow-surface-1 sticky top-0 z-20 shadow-sm">
    <div class="p-3 pb-1">
      <div class="flex flex-col justify-between gap-4 lg:flex-row">
        <div class="w-full max-w-xl">
          <SearchFilter
            model={props.model.filtersModel}
            placeholder={props.searchPlaceholder}
          />
        </div>

        <div class="flex md:gap-4">
          <Show when={props.showSort}>
            <SortFilter
              model={props.model.filtersModel}
              class="w-full min-w-[8rem]"
              items={props.model.filtersModel.sortOptions}
            />
          </Show>

          <TimeRangeFilter model={props.model.filtersModel} />

          {props.extraFilters}
        </div>
      </div>
    </div>
  </header>
)

type ColumnHeadersProps<Item, Sort extends string = string> = {
  columns: Accessor<readonly EntityExplorerColumn<Item, Sort>[]>
  gridTemplate: Accessor<string>
  columnContext: ColumnContext<Sort>
  renderCount: PrimaryHeaderRenderer
  count: Accessor<number>
}

const ColumnHeaders = <Item, Sort extends string = string>(
  props: ColumnHeadersProps<Item, Sort>,
) => (
  <div
    class="bg-surface-1 text-text-dim grid items-end gap-2 px-2 py-1 text-center text-[10px] md:gap-4 md:px-0 md:pr-6 md:pl-4"
    style={{'grid-template-columns': props.gridTemplate()}}
  >
    <div class="text-text-dim min-w-0 text-left text-sm">
      {props.renderCount(props.count())}
    </div>
    <For each={props.columns().slice(1)}>
      {(col) => {
        const header = col.header
        const ctx = props.columnContext
        const align =
          col.align === 'right'
            ? 'text-right'
            : col.align === 'center'
              ? 'text-center'
              : 'text-left'

        return (
          <span class={align}>
            {header ? (typeof header === 'function' ? header(ctx) : header) : ''}
          </span>
        )
      }}
    </For>
  </div>
)

type PanelBodyProps<Item, Sort extends string = string> = {
  items: Accessor<Item[]>
  columns: Accessor<readonly EntityExplorerColumn<Item, Sort>[]>
  gridTemplate: Accessor<string>
  columnContext: ColumnContext<Sort>
  getRowHref?: (item: Item) => string | undefined
  getRowKey?: (item: Item, index: number) => string | number
  emptyState?: JSX.Element
  estimateSize: number
}

const PanelBody = <Item, Sort extends string = string>(
  props: PanelBodyProps<Item, Sort>,
) => (
  <Show
    when={props.items().length > 0}
    fallback={
      <div class="bg-surface-1/50 flex flex-1 items-center justify-center p-4">
        {props.emptyState ?? 'No items'}
      </div>
    }
  >
    <VirtualList
      items={props.items}
      estimateSize={props.estimateSize}
      overscan={32}
      getItemKey={(item, index) => props.getRowKey?.(item, index) ?? index}
    >
      {(item) =>
        item && (
          <PanelRow
            item={item}
            columns={props.columns}
            gridTemplate={props.gridTemplate}
            columnContext={props.columnContext}
            getRowHref={props.getRowHref}
            height={props.estimateSize}
          />
        )
      }
    </VirtualList>
  </Show>
)

type PanelRowProps<Item, Sort extends string = string> = {
  item: Item
  columns: Accessor<readonly EntityExplorerColumn<Item, Sort>[]>
  gridTemplate: Accessor<string>
  columnContext: ColumnContext<Sort>
  getRowHref?: (item: Item) => string | undefined
  height: number
}

const PanelRow = <Item, Sort extends string = string>(
  props: PanelRowProps<Item, Sort>,
) => {
  const ctx = props.columnContext
  const columns = props.columns()

  const row = (
    <div
      class="hover:bg-surface-hover grid items-center gap-2 px-2 md:gap-4 md:px-4"
      style={{'grid-template-columns': props.gridTemplate(), height: `${props.height}px`}}
    >
      <For each={columns}>
        {(col) => {
          const align =
            col.align === 'right'
              ? 'text-right'
              : col.align === 'center'
                ? 'text-center'
                : 'text-left'
          return (
            <div
              class={clsx(
                'text-text min-w-0 py-2 text-sm tabular-nums',
                align,
                col.cellClass,
              )}
            >
              {col.render(props.item, ctx)}
            </div>
          )
        }}
      </For>
    </div>
  )

  const href = props.getRowHref?.(props.item)
  return href ? (
    <A href={href} class="block">
      {row}
    </A>
  ) : (
    row
  )
}
