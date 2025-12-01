import {For, type Accessor, type JSX, createMemo} from 'solid-js'
import {createVirtualizer} from '@tanstack/solid-virtual'
import clsx from 'clsx'

type VirtualListProps<T> = {
  items: T[] | Accessor<T[]>
  children: (item: T, index: number) => JSX.Element
  estimateSize?: number | ((index: number, item: T) => number)
  overscan?: number
  getItemKey?: (item: T, index: number) => string | number
  class?: string
  innerClass?: string
  style?: JSX.CSSProperties | string
}

export const VirtualList = <T,>(props: VirtualListProps<T>) => {
  // Normalize items to accessor
  const src: Accessor<T[]> =
    typeof props.items === 'function'
      ? (props.items as Accessor<T[]>)
      : () => props.items as T[]

  let scrollRef!: HTMLDivElement

  // Estimate size function - handles both fixed and dynamic sizes
  const estimate = (i: number) => {
    const arr = src()
    if (typeof props.estimateSize === 'function') {
      const item = arr[i]
      return item !== undefined
        ? (props.estimateSize as (i: number, it: T) => number)(i, item)
        : 44
    }
    return props.estimateSize ?? 44
  }

  // Key function for items
  const getKey = props.getItemKey ?? ((_: T, i: number) => i)

  // Reactive count - triggers virtualizer update when items change
  const count = createMemo(() => src().length)

  // TanStack solid-virtual handles reactivity internally:
  // - Uses createStore for virtualItems (Solid Store - deeply reactive)
  // - Uses createSignal for totalSize
  // - Internal createComputed tracks options via getter and calls measure()
  // - onChange callback updates store with reconcile() for efficient updates
  const virtualizer = createVirtualizer({
    // Using getter syntax for reactive count tracking
    get count() {
      return count()
    },
    getScrollElement: () => scrollRef,
    estimateSize: estimate,
    overscan: props.overscan ?? 12,
    getItemKey: (i) => {
      const arr = src()
      return i < arr.length ? getKey(arr[i]!, i) : i
    },
  })

  return (
    <div
      ref={scrollRef}
      class={clsx(
        'no-scroll bg-surface-1/50 h-full overflow-y-auto will-change-transform',
        props.class,
      )}
      style={props.style}
    >
      <div
        class={clsx('relative w-full', props.innerClass)}
        style={{height: `${virtualizer.getTotalSize()}px`}}
      >
        <For each={virtualizer.getVirtualItems()}>
          {(v) => {
            const item = () => src()[v.index]
            return (
              <div
                ref={(el) => virtualizer.measureElement(el)}
                data-index={v.index}
                class={clsx('absolute right-0 left-0')}
                style={{
                  transform: `translateY(${v.start}px)`,
                }}
              >
                {item() && props.children(item()!, v.index)}
              </div>
            )
          }}
        </For>
      </div>
    </div>
  )
}
