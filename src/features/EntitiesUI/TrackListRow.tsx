import {A} from '@solidjs/router'
import type {JSX} from 'solid-js'
import type {EnrichedTrack} from '@/features/magic'
import {
  ENTITY_ROW_HEIGHT,
  createEntityRowNavigation,
  entityRowBaseClasses,
} from './entityRowNavigation'
import {formatEntityDuration} from './formats'

const buildAlbumHref = (track: EnrichedTrack) => {
  if (!track.artistName || !track.albumName) return undefined
  return `/artists/${encodeURIComponent(track.artistName)}/${encodeURIComponent(track.albumName)}`
}

const buildArtistHref = (track: EnrichedTrack) => {
  if (!track.artistName) return undefined
  return `/artists/${encodeURIComponent(track.artistName)}`
}

type TrackListRowProps = {
  track: EnrichedTrack
  index: number
  secondaryLine?: 'album' | 'artist'
}

export const TrackListRow = (props: TrackListRowProps) => {
  let rowRef: HTMLDivElement | undefined
  let linkRef: HTMLAnchorElement | undefined

  const {handleRowKeyDown, handleLinkKeyDown} = createEntityRowNavigation(
    () => rowRef,
    () => linkRef,
  )

  const secondaryLine = props.secondaryLine ?? 'album'

  let secondaryLineNode: JSX.Element
  if (secondaryLine === 'artist') {
    const artistHref = buildArtistHref(props.track)
    if (artistHref && props.track.artistName) {
      secondaryLineNode = (
        <A
          ref={(el) => (linkRef = el ?? undefined)}
          href={artistHref}
          class="text-text-muted hov-decor focus-visible:text-text-strong inline-flex max-w-full self-start text-sm outline-none"
          tabIndex={-1}
          data-entity-link
          onKeyDown={handleLinkKeyDown}
        >
          <span class="group-hover:text-text-strong truncate">
            {props.track.artistName}
          </span>
        </A>
      )
    } else {
      linkRef = undefined
      secondaryLineNode = (
        <span class="text-text-muted inline-block max-w-full self-start truncate text-xs">
          {props.track.artistName ?? 'Unknown artist'}
        </span>
      )
    }
  } else {
    const albumHref = buildAlbumHref(props.track)
    if (albumHref && props.track.albumName) {
      secondaryLineNode = (
        <A
          ref={(el) => (linkRef = el ?? undefined)}
          href={albumHref}
          class="text-text-muted hov-decor focus-visible:text-text-strong inline-flex max-w-full self-start text-sm outline-none"
          tabIndex={-1}
          data-entity-link
          onKeyDown={handleLinkKeyDown}
        >
          <span class="group-hover:text-text-strong truncate">
            {props.track.albumName}
          </span>
        </A>
      )
    } else {
      linkRef = undefined
      secondaryLineNode = (
        <span class="text-text-muted inline-block max-w-full self-start truncate text-xs">
          {props.track.albumName ?? 'Unknown album'}
        </span>
      )
    }
  }

  return (
    <div
      ref={(el) => (rowRef = el)}
      data-entity-row="true"
      tabIndex={-1}
      role="group"
      class={`${entityRowBaseClasses} grid grid-cols-[auto_1fr_100px_120px] items-center gap-4 select-none`}
      style={{height: `${ENTITY_ROW_HEIGHT}px`}}
      onKeyDown={handleRowKeyDown}
      onMouseDown={() => {
        rowRef?.focus()
        if (linkRef) linkRef.focus()
      }}
    >
      <span class="text-text-muted w-6 text-right">{props.index + 1}</span>
      <div class="flex min-w-0 flex-col gap-1">
        <span class="text-text-strong group-hover:text-text group-focus-within:text-text truncate">
          {props.track.trackName ?? 'Unknown track'}
        </span>
        {secondaryLineNode}
      </div>
      <div class="text-text flex items-center gap-1 tabular-nums">
        <span>{props.track.playsCount.toLocaleString()}</span>
        <span class="text-text-muted text-xs">plays</span>
      </div>
      <span class="text-text-muted text-right tabular-nums">
        {formatEntityDuration(props.track.totalMs)}
      </span>
    </div>
  )
}
