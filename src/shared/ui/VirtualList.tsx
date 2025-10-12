import {For, type Accessor, type JSX, createMemo, createEffect, Show} from 'solid-js'
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
  const src: Accessor<T[]> =
    typeof props.items === 'function' ? (props.items as Accessor<T[]>) : () => props.items as T[]

  let scrollRef!: HTMLDivElement

  const estimate = (i: number) =>
    typeof props.estimateSize === 'function'
      ? (props.estimateSize as (i: number, it: T) => number)(i, src()[i])
      : props.estimateSize ?? 44

  const getKey = props.getItemKey ?? ((_: T, i: number) => i)
  const count = createMemo(() => src().length)

  const rowVirtualizer = createVirtualizer({
    count: count(),
    getScrollElement: () => scrollRef,
    estimateSize: estimate,
    overscan: props.overscan ?? 12,
    getItemKey: (i) => {
      const arr = src()
      return i < arr.length ? getKey(arr[i]!, i) : i
    },
  })

  createEffect(() => {
    rowVirtualizer.setOptions({
      ...rowVirtualizer.options,
      count: count(),
      getScrollElement: () => scrollRef,
      estimateSize: estimate,
      overscan: props.overscan ?? 12,
      getItemKey: (i) => {
        const arr = src()
        return i < arr.length ? getKey(arr[i]!, i) : i
      },
    })
    rowVirtualizer.measure()
  })

  const virtualItems = () => rowVirtualizer.getVirtualItems()
  const totalSize = () => rowVirtualizer.getTotalSize()

  return (
    <div
      ref={scrollRef}
      class={clsx(
        'h-full overflow-y-auto will-change-transform no-scroll bg-surface-1/50',
        props.class,
      )}
      style={props.style}
    >
      <div class={clsx('relative w-full', props.innerClass)} style={{height: `${totalSize()}px`}}>
        <For each={virtualItems()}>
          {(v) => (
            <div
              ref={(el) => rowVirtualizer.measureElement(el)}
              data-index={v.index}
              class={clsx('absolute left-0 right-0')}
              style={{
                transform: `translateY(${v.start}px)`,
              }}
            >
              {props.children(src()[v.index], v.index)}
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
