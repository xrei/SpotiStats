import {type Component, For, Show, createSignal} from 'solid-js'
import type {PeakActivity} from '../types'

type Props = {
  peaks: PeakActivity
}

export const PeakChart: Component<Props> = (props) => {
  const [expanded, setExpanded] = createSignal(false)

  const allPeaks = () => {
    const peaks = props.peaks.primary
      ? [props.peaks.primary, ...props.peaks.secondary]
      : props.peaks.secondary
    return peaks.slice(0, 6)
  }

  return (
    <Show when={allPeaks().length > 0}>
      <div>
        <button onClick={() => setExpanded(!expanded())} class="hov-decor mb-4 text-sm">
          {expanded() ? 'Hide details' : 'See details...'}
        </button>

        <Show when={expanded()}>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <For each={allPeaks()}>
              {(peak) => (
                <div class="bg-surface-2/30 rounded-lg px-4 py-3">
                  <div class="text-text-strong mb-1 text-sm font-semibold">
                    {peak.label}
                  </div>
                  <div class="text-text-muted text-xs">
                    {peak.plays.toLocaleString()} plays · {peak.hours.toFixed(1)}h
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </Show>
  )
}
