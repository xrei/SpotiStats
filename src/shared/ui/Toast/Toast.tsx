import {createSignal, onMount, onCleanup} from 'solid-js'
import clsx from 'clsx'
import type {Toast as ToastData, ToastType} from './model'

type ToastProps = ToastData & {
  onDismiss: () => void
}

const typeStyles: Record<ToastType, string> = {
  error: 'bg-danger',
  success: 'bg-accent',
  info: 'bg-accent-3',
  warning: 'bg-accent-2',
}

const CloseIcon = () => (
  <svg
    class="size-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
)

export const Toast = (props: ToastProps) => {
  const [isExiting, setIsExiting] = createSignal(false)
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const dismiss = () => {
    setIsExiting(true)
    // Wait for exit animation to complete
    setTimeout(() => {
      props.onDismiss()
    }, 300)
  }

  onMount(() => {
    if (props.duration > 0) {
      timeoutId = setTimeout(dismiss, props.duration)
    }
  })

  onCleanup(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })

  return (
    <div
      role={props.type === 'error' ? 'alert' : 'status'}
      aria-live={props.type === 'error' ? 'assertive' : 'polite'}
      class={clsx(
        'flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg',
        typeStyles[props.type],
        isExiting() ? 'animate-toast-out' : 'animate-toast-in',
      )}
    >
      <span class="flex-1">{props.message}</span>
      <button
        type="button"
        onClick={dismiss}
        class="rounded p-1 transition-colors hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none"
        aria-label="Dismiss notification"
      >
        <CloseIcon />
      </button>
    </div>
  )
}
