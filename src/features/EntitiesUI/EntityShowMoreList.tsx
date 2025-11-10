import clsx from 'clsx'
import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  type Accessor,
  type JSX,
} from 'solid-js'
import {ENTITY_ROW_HEIGHT, createEntityListNavigation} from './entityRowNavigation'

type EntityShowMoreListProps<T> = {
  title: string
  items: Accessor<readonly T[]>
  renderItem: (item: T, index: number) => JSX.Element
  emptyLabel?: string
  collapsedLabel?: string
  expandedLabel?: string
  collapsedCount?: number
  expandedCount?: number
  maxItems?: number
  minItemsToToggle?: number
  class?: string
  listClass?: string
}

const DEFAULT_COLLAPSED_COUNT = 5
const DEFAULT_EXPANDED_COUNT = 10

export const EntityShowMoreList = <T,>(props: EntityShowMoreListProps<T>) => {
  const collapsedCount = props.collapsedCount ?? DEFAULT_COLLAPSED_COUNT
  const expandedCount = props.expandedCount ?? DEFAULT_EXPANDED_COUNT
  const minItemsToToggle = props.minItemsToToggle ?? collapsedCount
  const collapsedLabel = props.collapsedLabel ?? 'Show more'
  const expandedLabel = props.expandedLabel ?? 'Show less'
  const emptyLabel = props.emptyLabel ?? 'No items found.'

  const items = createMemo(() => {
    const limit = props.maxItems ?? Number.POSITIVE_INFINITY
    const list = props.items()
    if (!Number.isFinite(limit)) return list
    return list.slice(0, limit)
  })

  const [expanded, setExpanded] = createSignal(false)
  createEffect(() => {
    if (expanded() && totalItems() <= collapsedCount) setExpanded(false)
  })

  const totalItems = createMemo(() => items().length)
  const visibleItems = createMemo(() => {
    const list = items()
    if (expanded()) return list
    return list.slice(0, collapsedCount)
  })
  const showToggle = createMemo(() => totalItems() > minItemsToToggle)

  let listRef: HTMLDivElement | undefined
  const {handleContainerKeyDown} = createEntityListNavigation(() => listRef)
  const collapsedClamp = createMemo(() => totalItems() > collapsedCount)
  const expandedScrollable = createMemo(() => expanded() && totalItems() > expandedCount)

  createEffect(() => {
    if (!expanded() && listRef) {
      listRef.scrollTop = 0
      if (typeof listRef.scrollTo === 'function') {
        listRef.scrollTo({top: 0, left: 0})
      }
    }
  })

  const maxHeight = createMemo(() => {
    if (!expanded()) {
      return collapsedClamp() ? `${collapsedCount * ENTITY_ROW_HEIGHT}px` : undefined
    }
    return totalItems() > expandedCount
      ? `${expandedCount * ENTITY_ROW_HEIGHT}px`
      : undefined
  })

  const listClasses = createMemo(() =>
    clsx(
      'divide-line-subtle divide-y',
      !expanded() && collapsedClamp() && 'overflow-hidden',
      expandedScrollable() && 'overflow-y-auto pr-2',
      'focus-visible:outline focus-visible:outline-accent focus-visible:outline-offset-2',
      props.listClass,
    ),
  )

  return (
    <section class={props.class}>
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-text-strong text-xl font-semibold">{props.title}</h2>
        <Show when={showToggle()}>
          <button
            type="button"
            class="text-text-muted hover:text-text text-sm transition-colors"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded() ? expandedLabel : collapsedLabel}
          </button>
        </Show>
      </div>

      <Show
        when={totalItems() > 0}
        fallback={
          <div class="text-text-muted py-8 text-center text-sm">{emptyLabel}</div>
        }
      >
        <div
          ref={(el) => (listRef = el)}
          class={listClasses()}
          tabIndex={0}
          role="listbox"
          onKeyDown={handleContainerKeyDown}
          style={maxHeight() ? {'max-height': maxHeight()} : undefined}
        >
          <For each={visibleItems()}>
            {(item, index) => props.renderItem(item, index())}
          </For>
        </div>
      </Show>
    </section>
  )
}
