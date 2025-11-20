import {useUnit} from 'effector-solid'
import type {JSX} from 'solid-js'
import clsx from 'clsx'
import type {FiltersModel} from '../model'
import type {Order} from '../types'

type SortFilterBaseProps<T extends string> = {
  items: readonly {label: string; value: T}[]
  value: T
  order: Order
  onChange: (v: {value: T; order: Order}) => void
  class?: string
}

function SortFilterBase<T extends string>(props: SortFilterBaseProps<T>): JSX.Element {
  const toggleOrder = () => {
    const next = props.order === 'asc' ? 'desc' : 'asc'
    props.onChange({value: props.value, order: next})
  }

  return (
    <div
      class={clsx(
        'border-b-line relative flex h-10 max-w-[200px] items-center border-b hover:rounded-sm',
        props.class,
      )}
    >
      <div
        class={clsx(
          'hover:bg-surface-hover text-text-strong flex h-full flex-1 items-stretch gap-1 rounded-sm',
        )}
      >
        <button
          type="button"
          onClick={toggleOrder}
          class={clsx(
            'flex h-full cursor-pointer items-center justify-center rounded-sm px-3',
            'text-text-muted hover:text-accent text-xl leading-none',
            'outline-focus-ring focus:outline',
          )}
        >
          {props.order === 'asc' ? '↑' : '↓'}
        </button>

        <div class="outline-focus-ring flex flex-1 rounded-sm pr-3 pl-0.5 focus-within:outline">
          <select
            class={clsx(
              'w-full truncate bg-transparent text-sm font-medium',
              'cursor-pointer appearance-none outline-none',
              'hover:text-accent transition-colors',
            )}
            value={props.value}
            onChange={(e) =>
              props.onChange({value: e.currentTarget.value as T, order: props.order})
            }
          >
            {props.items.map((it) => (
              <option value={it.value}>{it.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export type SortFilterProps<T extends string> = Pick<
  SortFilterBaseProps<T>,
  'items' | 'class'
> & {
  model: FiltersModel<T>
}

export function SortFilter<T extends string>({
  model,
  ...p
}: SortFilterProps<T>): JSX.Element {
  const {$order, $sortBy, orderChanged, sortByChanged} = useUnit(model.Sort)

  return (
    <SortFilterBase
      value={$sortBy()}
      order={$order()}
      onChange={({value, order}) => {
        sortByChanged(value)
        orderChanged(order)
      }}
      {...p}
    />
  )
}
