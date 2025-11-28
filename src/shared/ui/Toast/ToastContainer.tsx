import {For} from 'solid-js'
import {Portal} from 'solid-js/web'
import {useUnit} from 'effector-solid'
import {$toasts, toastRemoved} from './model'
import {Toast} from './Toast'

export const ToastContainer = () => {
  const toasts = useUnit($toasts)

  return (
    <Portal mount={document.body}>
      <div
        class="pointer-events-none fixed right-4 bottom-4 z-[9999] flex flex-col gap-2"
        aria-label="Notifications"
      >
        <For each={toasts()}>
          {(toast) => (
            <div class="pointer-events-auto">
              <Toast {...toast} onDismiss={() => toastRemoved(toast.id)} />
            </div>
          )}
        </For>
      </div>
    </Portal>
  )
}
