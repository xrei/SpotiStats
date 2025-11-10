import type {JSX} from 'solid-js'
import clsx from 'clsx'

type Option<T extends string> = {label: string; value: T}

type MetricSelectProps<T extends string> = {
  items: readonly Option<T>[]
  value: T
  onChange: (v: T) => void
  class?: string
  ariaLabel?: string
}

export function MetricSelect<T extends string>(p: MetricSelectProps<T>): JSX.Element {
  return (
    <div
      class={clsx(
        'hover:bg-surface-hover relative inline-flex items-center rounded-sm',
        'outline-focus-ring focus-within:outline',
        p.class,
      )}
    >
      <select
        aria-label={p.ariaLabel ?? 'Metric'}
        class={clsx(
          'text-text-strong w-full truncate bg-transparent text-sm font-medium',
          'px-2 py-1.5 pr-6',
          'cursor-pointer appearance-none outline-none',
          'hover:text-accent transition-colors',
        )}
        value={p.value}
        onChange={(e) => p.onChange(e.currentTarget.value as T)}
      >
        {p.items.map((it) => (
          <option value={it.value}>{it.label}</option>
        ))}
      </select>

      <span class="text-text-muted pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">
        ▼
      </span>
    </div>
  )
}
