import {ErrorBoundary as SolidErrorBoundary, type JSX} from 'solid-js'
import {Card} from './Card'

type Props = {
  children: JSX.Element
  fallback?: (err: Error, reset: () => void) => JSX.Element
}

export const AppErrorBoundary = (props: Props) => (
  <SolidErrorBoundary
    fallback={(err, reset) => {
      console.error('ErrorBoundary caught:', err)
      return (
        props.fallback?.(err as Error, reset) ?? (
          <div class="flex flex-1 items-center justify-center p-6">
            <Card class="w-full max-w-md p-6 text-center">
              <div class="mb-4 text-4xl" aria-hidden="true">
                :(
              </div>
              <h2 class="text-text-strong mb-2 text-xl font-bold">
                Something went wrong
              </h2>
              <p class="text-text-muted mb-4 text-sm">{(err as Error).message}</p>
              <button
                type="button"
                onClick={reset}
                class="bg-accent hover:bg-accent-2 focus-ring rounded-lg px-4 py-2 text-white transition-colors"
              >
                Try again
              </button>
            </Card>
          </div>
        )
      )
    }}
  >
    {props.children}
  </SolidErrorBoundary>
)
