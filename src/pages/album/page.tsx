import {A, useParams} from '@solidjs/router'
import {useGate, useUnit} from 'effector-solid'
import {For, Show, type Accessor} from 'solid-js'
import type {EnrichedAlbum, EnrichedTrack} from '@/features/magic'
import {TrackListRow} from '@/features/EntitiesUI'
import {createEntityListNavigation} from '@/features/EntitiesUI/entityRowNavigation'
import {dateLib} from '@/shared/lib'
import * as albumModel from './model'
import {PeakPlaysCard} from './PeakPlaysCard'
import type {PeakActivity} from './peakActivity'

const AlbumHeader = (props: {
  album: Accessor<EnrichedAlbum>
  stats: Accessor<albumModel.AlbumStats>
  peak: Accessor<PeakActivity>
}) => {
  const album = props.album
  const stats = props.stats
  const peak = props.peak

  const artistHref = () => `/artists/${encodeURIComponent(album().artistName)}`

  return (
    <section class="relative z-10 px-10 py-10">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div class="flex flex-col gap-4 lg:max-w-[60%]">
          <div class="flex flex-col gap-2">
            <span class="text-text-muted text-xs tracking-[0.2em] uppercase">Album</span>
            <h1 class="text-text-strong text-4xl font-bold md:text-5xl">{album().name}</h1>
            <A
              href={artistHref()}
              class="text-text decoration-accent hover:text-text-strong focus-visible:text-text-strong text-lg decoration-3 underline-offset-8 outline-none hover:underline focus-visible:underline"
            >
              {album().artistName}
            </A>
          </div>

          <div class="text-text-strong flex flex-wrap items-center gap-2 text-sm font-medium md:text-base">
            <span>{stats().plays} plays</span>
            <span class="text-text-muted">•</span>
            <span>{stats().playTime}</span>
            <span class="text-text-muted">•</span>
            <span>{stats().tracksCount.toLocaleString()} tracks</span>
          </div>

          <div class="text-text flex flex-wrap items-center gap-2 text-xs md:text-sm">
            <span>First played {dateLib.formatDate(stats().firstTs, 'medium') ?? '—'}</span>
            <span class="text-text-muted">•</span>
            <span>Last played {dateLib.formatDate(stats().lastTs, 'medium') ?? '—'}</span>
          </div>
        </div>

        <PeakPlaysCard peak={peak} />
      </div>
    </section>
  )
}

const AlbumTracksSection = (props: {tracks: Accessor<readonly EnrichedTrack[]>}) => {
  let listRef: HTMLDivElement | undefined
  const {handleContainerKeyDown} = createEntityListNavigation(() => listRef)

  return (
    <section class="relative z-10 px-3 py-8 lg:px-6">
      <h2 class="text-text-strong text-xl font-semibold">Tracks</h2>
      <Show
        when={props.tracks().length > 0}
        fallback={
          <div class="text-text-muted py-8 text-center text-sm">No tracks found.</div>
        }
      >
        <div
          ref={(el) => (listRef = el ?? undefined)}
          class="divide-line/30 focus-visible:outline-accent mt-4 divide-y focus-visible:outline focus-visible:outline-offset-2"
          tabIndex={0}
          role="listbox"
          onKeyDown={handleContainerKeyDown}
        >
          <For each={props.tracks()}>
            {(track, index) => (
              <TrackListRow track={track} index={index()} secondaryLine="artist" />
            )}
          </For>
        </div>
      </Show>
    </section>
  )
}

const AlbumPage = () => {
  const params = useParams<{artist: string; album: string}>()
  useGate(albumModel.AlbumPageGate, {
    artist: decodeURIComponent(params.artist),
    album: decodeURIComponent(params.album),
  })

  const album = useUnit(albumModel.$albumData)
  const stats = useUnit(albumModel.$albumStats)
  const peak = useUnit(albumModel.$peakActivity)
  const tracks = useUnit(albumModel.$albumTracks)

  return (
    <div class="relative z-0 m-2 flex h-full min-h-0 flex-col">
      <Show
        when={album()}
        fallback={
          <div class="flex h-full items-center justify-center text-lg">
            Album not found
          </div>
        }
      >
        {(albumAccessor) => (
          <div class="relative flex-1 overflow-hidden rounded-xl">
            <div
              class="bg-surface-1/50 relative h-full overflow-y-auto will-change-scroll"
              style={{'scrollbar-gutter': 'stable'}}
            >
              <div
                class="from-surface-1/10 to-accent/80 pointer-events-none absolute inset-x-0 top-0 -z-10 bg-linear-to-t backdrop-blur-xs"
                style={{
                  height: 'clamp(280px, 35vh, 500px)',
                }}
              />
              <AlbumHeader album={albumAccessor} stats={stats} peak={peak} />
              <AlbumTracksSection tracks={tracks} />
            </div>
          </div>
        )}
      </Show>
    </div>
  )
}

export default AlbumPage
