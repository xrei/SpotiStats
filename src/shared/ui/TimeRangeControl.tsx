import {createSignal} from 'solid-js'
import {CalendarIcon, XIcon} from './icons'
import clsx from 'clsx'

export type FixedRange = '1M' | '3M' | '6M' | '1Y' | 'All'
export type DateRange = {from: string; to: string}
export type TimeRange =
  | {kind: 'fixed'; value: FixedRange; from?: string; to?: string}
  | {kind: 'range'; value?: FixedRange; from: string; to: string}

const DEF_RANGE: FixedRange = 'All'

const FixedRangeToggle = (props: {
  value?: () => FixedRange
  defaultValue?: FixedRange
  onChange?: (v: FixedRange) => void
  class?: string
}) => {
  const [inner, setInner] = createSignal<FixedRange>(props.defaultValue ?? DEF_RANGE)
  const val = () => (props.value ? props.value() : inner())
  const set = (v: FixedRange) => (props.onChange ? props.onChange(v) : setInner(v))

  const opts: FixedRange[] = ['1M', '3M', '6M', '1Y', 'All']

  return (
    <div class={`inline-flex items-center ${props.class ?? ''}`}>
      {opts.map((o) => {
        const active = val() === o
        return (
          <button
            type="button"
            onClick={() => set(o)}
            class={clsx(
              'px-3 py-1.5 text-sm cursor-pointer',
              'focus:outline outline-focus-ring rounded-lg transition-colors  hover:bg-surface-hover',
              active ? 'text-accent bg-surface-1' : 'text-text hover:text-text-strong',
            )}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}

const DateRangePicker = (props: {
  value?: () => DateRange | null
  defaultValue?: DateRange | null
  onChange?: (v: DateRange | null) => void
  min?: string
  max?: string
  class?: string
}) => {
  const [inner, setInner] = createSignal<DateRange | null>(props.defaultValue ?? null)
  const val = () => (props.value ? props.value() : inner())
  const set = (v: DateRange | null) => (props.onChange ? props.onChange(v) : setInner(v))

  let max = props.max
  if (!max) {
    const todayPlusOne = new Date()
    todayPlusOne.setDate(todayPlusOne.getDate() + 1)
    max = todayPlusOne.toISOString().slice(0, 10)
  }

  const update = (next: Partial<DateRange>) => {
    const cur = val() ?? {from: '', to: ''}
    const merged = {...cur, ...next}

    if (!merged.from && !merged.to) return set(null)
    if (merged.from && merged.to && merged.to < merged.from) merged.to = merged.from

    set(merged as DateRange)
  }

  const clear = () => set(null)

  return (
    <div
      class={`flex items-center gap-2 rounded-lg bg-surface-1 px-2 py-1.5 text-sm text-text ${
        props.class ?? ''
      }`}
    >
      <input
        type="date"
        min={props.min}
        max={val()?.to || max}
        value={val()?.from || ''}
        onInput={(e) => update({from: (e.currentTarget as HTMLInputElement).value})}
        class="bg-transparent outline-none border-0 text-text [color-scheme:dark]"
      />

      <span class="px-1 text-text-muted">—</span>

      <input
        type="date"
        min={val()?.from || props.min}
        max={max}
        value={val()?.to || ''}
        onInput={(e) => update({to: (e.currentTarget as HTMLInputElement).value})}
        class="bg-transparent outline-none border-0 text-text [color-scheme:dark]"
      />

      <button
        type="button"
        onClick={clear}
        class="grid size-6 place-items-center rounded text-text-muted hover:text-text-strong"
      >
        <XIcon class="size-4" />
      </button>
    </div>
  )
}

export type TimeRangeControlProps = {
  value?: () => TimeRange
  defaultValue?: TimeRange
  onChange?: (v: TimeRange) => void
  min?: string
  max?: string
  class?: string
}

export const TimeRangeControl = (props: TimeRangeControlProps) => {
  const [inner, setInner] = createSignal<TimeRange>(
    props.defaultValue ?? {kind: 'fixed', value: DEF_RANGE},
  )
  const val = () => (props.value ? props.value() : inner())
  const set = (v: TimeRange) => (props.onChange ? props.onChange(v) : setInner(v))

  const [showRange, setShowRange] = createSignal(val().kind === 'range')

  const setFixed = (v: FixedRange) => {
    set({kind: 'fixed', value: v})
    setShowRange(false)
  }

  const onRange = (r: DateRange | null) => {
    if (r) {
      set({kind: 'range', from: r.from, to: r.to})
    } else {
      const current = val()
      const lastFixed = current.kind === 'fixed' ? current.value : DEF_RANGE
      set({kind: 'fixed', value: lastFixed})
      setShowRange(false)
    }
  }

  return (
    <div class={clsx(`inline-flex items-center`, 'border-b border-b-line', props.class)}>
      {!showRange() && (
        <>
          <FixedRangeToggle
            value={() => {
              const current = val()
              return current.kind === 'fixed' ? current.value : DEF_RANGE
            }}
            onChange={setFixed}
          />
          <button
            type="button"
            onClick={() => setShowRange(true)}
            class="rounded-lg px-3 py-1.5 text-sm text-text hover:bg-surface-hover focus:outline outline-focus-ring"
            aria-label="Pick date range"
          >
            <CalendarIcon class="size-5 text-text-muted" />
          </button>
        </>
      )}

      {showRange() && (
        <DateRangePicker
          value={() => {
            const current = val()
            return current.kind === 'range' ? {from: current.from, to: current.to} : null
          }}
          onChange={onRange}
          min={props.min}
          max={props.max}
        />
      )}
    </div>
  )
}
