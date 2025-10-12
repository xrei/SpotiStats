import type {EnrichedTrack} from '@/features/magic'
import {For, Show} from 'solid-js'

const formatDuration = (ms: number) => {
  const totalSeconds = Math.round(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  if (hours > 0) return `${hours}:${minutes}:${seconds}`
  return `${minutes}:${seconds}`
}

export const TracksSection = (props: {
  tracks: () => EnrichedTrack[]
  visibleTracks: () => EnrichedTrack[]
  expanded: () => boolean
  toggleExpanded: () => void
}) => (
  <section class="relative">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-text-strong text-xl font-semibold">Top Tracks</h2>
      <Show when={props.tracks().length > 5}>
        <button
          type="button"
          class="text-text-muted hover:text-text text-sm transition-colors"
          onClick={props.toggleExpanded}
        >
          {props.expanded() ? 'Show less' : 'Show more'}
        </button>
      </Show>
    </div>

    <Show
      when={props.visibleTracks().length > 0}
      fallback={
        <div class="text-text-muted py-8 text-center text-sm">No tracks found.</div>
      }
    >
      <div class="divide-line/30 divide-y">
        <For each={props.visibleTracks()}>
          {(track, index) => (
            <div class="grid grid-cols-[auto_1fr_100px_100px] items-center gap-4 py-3 text-sm">
              <span class="text-text-muted w-6 text-right">{index() + 1}</span>
              <div class="flex flex-col gap-1">
                <span class="text-text-strong truncate">
                  {track.trackName ?? 'Unknown track'}
                </span>
                <span class="text-text-muted text-xs">
                  {track.albumName ?? 'Unknown album'}
                </span>
              </div>
              <div>
                <span class="text-text tabular-nums">
                  {track.playsCount.toLocaleString()}
                </span>
                <span class="text-text-muted pl-1 text-xs">plays</span>
              </div>
              <span class="text-text-muted text-right tabular-nums">
                {formatDuration(track.totalMs)}
              </span>
            </div>
          )}
        </For>
      </div>
    </Show>
  </section>
)
