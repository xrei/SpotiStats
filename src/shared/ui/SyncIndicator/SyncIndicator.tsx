import {Show} from 'solid-js'
import clsx from 'clsx'

type SyncIndicatorProps = {
  active: boolean
  class?: string
}

const COG_PATH =
  'M15.21 22.19C15 22.19 14.79 22.16 14.58 22.11C13.96 21.94 13.44 21.55 13.11 21L12.99 20.8C12.4 19.78 11.59 19.78 11 20.8L10.89 20.99C10.56 21.55 10.04 21.95 9.42 22.11C8.79 22.28 8.14 22.19 7.59 21.86L5.87 20.87C5.26 20.52 4.82 19.95 4.63 19.26C4.45 18.57 4.54 17.86 4.89 17.25C5.18 16.74 5.26 16.28 5.09 15.99C4.92 15.7 4.49 15.53 3.9 15.53C2.44 15.53 1.25 14.34 1.25 12.88V11.12C1.25 9.66 2.44 8.47 3.9 8.47C4.49 8.47 4.92 8.3 5.09 8.01C5.26 7.72 5.19 7.26 4.89 6.75C4.54 6.14 4.45 5.42 4.63 4.74C4.81 4.05 5.25 3.48 5.87 3.13L7.6 2.14C8.73 1.47 10.22 1.86 10.9 3.01L11.02 3.21C11.61 4.23 12.42 4.23 13.01 3.21L13.12 3.02C13.8 1.86 15.29 1.47 16.43 2.15L18.15 3.14C18.76 3.49 19.2 4.06 19.39 4.75C19.57 5.44 19.48 6.15 19.13 6.76C18.84 7.27 18.76 7.73 18.93 8.02C19.1 8.31 19.53 8.48 20.12 8.48C21.58 8.48 22.77 9.67 22.77 11.13V12.89C22.77 14.35 21.58 15.54 20.12 15.54C19.53 15.54 19.1 15.71 18.93 16C18.76 16.29 18.83 16.75 19.13 17.26C19.48 17.87 19.58 18.59 19.39 19.27C19.21 19.96 18.77 20.53 18.15 20.88L16.42 21.87C16.04 22.08 15.63 22.19 15.21 22.19Z'

const CENTER_PATH = 'M12 15.75C9.93 15.75 8.25 14.07 8.25 12C8.25 9.93 9.93 8.25 12 8.25C14.07 8.25 15.75 9.93 15.75 12C15.75 14.07 14.07 15.75 12 15.75Z'

// 6 teeth at path extremes
const TEETH = [
  { x: 15.21, y: 22.19 },
  { x: 7.59, y: 21.86 },
  { x: 1.25, y: 12 },
  { x: 7.6, y: 2.14 },
  { x: 16.43, y: 2.15 },
  { x: 22.77, y: 12 },
]

export const SyncIndicator = (props: SyncIndicatorProps) => (
  <Show when={props.active}>
    <div class={clsx('sync-indicator-container', props.class)} role="status" title="Saving...">
      <NeuralCogSVG />
    </div>
  </Show>
)

const NeuralCogSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" class="size-6" style="overflow: inherit">
    {/* Base cog */}
    <path d={COG_PATH} class="cog-base" pathLength={100} />
    <path d={CENTER_PATH} class="cog-base" />

    {/* Animated line */}
    <path d={COG_PATH} class="cog-line" pathLength={100} />

    {/* Dots */}
    {TEETH.map((t, i) => (
      <circle cx={t.x} cy={t.y} r={1.3} class={`cog-node cog-node-${i}`} />
    ))}

    {/* Center */}
    <circle cx={12} cy={12} r={3.75} class="cog-center-ring" pathLength={100} />
  </svg>
)

export const NeuralCogTest = () => (
  <div class="sync-indicator-container">
    <NeuralCogSVG />
  </div>
)
