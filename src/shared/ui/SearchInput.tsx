import clsx from 'clsx'
import {type JSX, createSignal, onCleanup, onMount} from 'solid-js'
import {XIcon} from '@/shared/ui'

export type SearchInputProps = {
  defaultValue?: string
  value?: () => string
  onChange?: (next: string) => void
  placeholder?: string
  class?: string
  shortcutHint?: boolean
  autoFocus?: boolean
  ariaLabel?: string
}

export const SearchInput = (props: SearchInputProps) => {
  const [inner, setInner] = createSignal(props.defaultValue ?? '')
  const get = () => (props.value ? props.value() : inner())
  const set = (v: string) => (props.onChange ? props.onChange(v) : setInner(v))

  if (!props.shortcutHint) props.shortcutHint = true

  let inputRef!: HTMLInputElement

  const clear = () => {
    if (!get()) return
    set('')
    inputRef?.focus()
  }

  const onKeyDown: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent> = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      clear()
    }
  }

  onMount(() => {
    if (props.autoFocus) inputRef?.focus()
    if (!props.shortcutHint) return
    const handler = (e: KeyboardEvent) => {
      const mod = navigator.platform.includes('Mac') ? e.metaKey : e.ctrlKey
      if (mod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        inputRef?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    onCleanup(() => window.removeEventListener('keydown', handler))
  })

  const hint = () => (navigator.platform.includes('Mac') ? '⌘ K' : 'Ctrl K')

  return (
    <div class="border-b-line h-10 border-b focus-within:rounded-sm hover:rounded-sm">
      <div
        role="search"
        class={clsx(
          'relative',
          'inline-flex h-full w-full items-center',
          'focus-within:bg-surface-1 rounded-sm',
          'hover:bg-surface-hover transition-colors',
          'outline-focus-ring focus-within:outline',
          props.class,
        )}
      >
        <SearchIcon class="text-text-muted pointer-events-none absolute left-3 size-5" />

        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          aria-label={props.ariaLabel ?? 'Search'}
          placeholder={props.placeholder ?? 'Search artists...'}
          class="text-text placeholder:text-text-muted h-full w-full rounded-2xl bg-transparent pr-10 pl-10 outline-none"
          value={get()}
          onInput={(e) => set((e.currentTarget as HTMLInputElement).value)}
          onKeyDown={onKeyDown}
          autocomplete="off"
          spellcheck={false}
        />

        {get() && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            class="text-text-muted hover:text-text-strong absolute right-2 grid size-7 place-items-center rounded-md transition-colors"
          >
            <XIcon class="size-5" />
          </button>
        )}

        {props.shortcutHint && !get() && (
          <span
            class="text-text-dim bg-surface pointer-events-none absolute right-2 rounded-md px-2 py-0.5 text-base select-none"
            aria-hidden="true"
          >
            {hint()}
          </span>
        )}
      </div>
    </div>
  )
}

const SearchIcon = (p: {class?: string}) => (
  <svg viewBox="0 0 24 24" fill="none" class={p.class}>
    <path
      d="M21 21l-4.2-4.2"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
    />
    <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.6" />
  </svg>
)
