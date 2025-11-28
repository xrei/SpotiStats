import {createEvent, createStore} from 'effector'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type Toast = {
  id: string
  message: string
  type: ToastType
  duration: number
}

type ToastInput = {
  message: string
  type?: ToastType
  duration?: number
}

const DEFAULT_DURATION = 5000

let toastId = 0
const generateId = () => `toast-${++toastId}`

// Events
export const toastAdded = createEvent<ToastInput>('toast added')
export const toastRemoved = createEvent<string>('toast removed')
export const toastsClear = createEvent<void>('toasts clear')

// Store
export const $toasts = createStore<Toast[]>([], {name: 'toasts'})

$toasts.on(toastAdded, (toasts, input) => {
  const toast: Toast = {
    id: generateId(),
    message: input.message,
    type: input.type ?? 'info',
    duration: input.duration ?? DEFAULT_DURATION,
  }
  // Limit to 5 toasts, remove oldest if needed
  const next = [...toasts, toast]
  return next.length > 5 ? next.slice(-5) : next
})

$toasts.on(toastRemoved, (toasts, id) => toasts.filter((t) => t.id !== id))

$toasts.on(toastsClear, () => [])

// Helper functions for common toast types
export const showError = (message: string) => {
  toastAdded({message, type: 'error'})
}

export const showSuccess = (message: string) => {
  toastAdded({message, type: 'success'})
}

export const showInfo = (message: string) => {
  toastAdded({message, type: 'info'})
}

export const showWarning = (message: string) => {
  toastAdded({message, type: 'warning'})
}
