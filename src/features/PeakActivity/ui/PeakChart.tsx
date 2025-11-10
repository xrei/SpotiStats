import {type Component, For, Show, createSignal} from 'solid-js'
import type {PeakActivity} from '../types'

type Props = {
  peaks: PeakActivity
}

export const PeakChart: Component<Props> = (props) => {
  const [expanded, setExpanded] = createSignal(false)

  const allPeaks = () => {
    const peaks = props.peaks.primary ? [props.peaks.primary, ...props.peaks.secondary] : props.peaks.secondary
    return peaks.slice(0, 6)
  }

  return (
    <Show when={allPeaks().length > 0}>
      <div>
        <button
          onClick={() => setExpanded(!expanded())}
          class="hov-decor text-sm mb-4"
        >
          {expanded() ? 'Hide details' : 'See details...'}
        </button>

        <Show when={expanded()}>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <For each={allPeaks()}>
              {(peak) => (
                <div class="bg-surface-2/30 rounded-lg px-4 py-3">
                  <div class="text-sm font-semibold text-text-strong mb-1">{peak.label}</div>
                  <div class="text-xs text-text-muted">
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
