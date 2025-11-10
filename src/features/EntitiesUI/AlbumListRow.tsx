import {A} from '@solidjs/router'
import type {JSX} from 'solid-js'
import type {EnrichedAlbum} from '@/features/Magic'
import {
  ENTITY_ROW_HEIGHT,
  createEntityRowNavigation,
  entityRowBaseClasses,
} from './entityRowNavigation'
import {formatEntityDuration, formatEntityLastPlayed} from './formats'

const buildAlbumHref = (album: EnrichedAlbum) =>
  `/artists/${encodeURIComponent(album.artistName)}/${encodeURIComponent(album.name)}`

export const AlbumListRow = (props: {album: EnrichedAlbum; index: number}) => {
  let rowRef: HTMLDivElement | undefined
  let linkRef: HTMLAnchorElement | undefined

  const {handleRowKeyDown, handleLinkKeyDown} = createEntityRowNavigation(
    () => rowRef,
    () => linkRef,
  )

  const albumHref = props.album.name ? buildAlbumHref(props.album) : undefined

  let albumNameNode: JSX.Element
  if (albumHref) {
    albumNameNode = (
      <A
        ref={(el) => (linkRef = el ?? undefined)}
        href={albumHref}
        class="text-text-strong hov-decor inline-flex max-w-full self-start"
        tabIndex={-1}
        data-entity-link
        onKeyDown={handleLinkKeyDown}
      >
        <span class="truncate">{props.album.name}</span>
      </A>
    )
  } else {
    linkRef = undefined
    albumNameNode = (
      <span class="text-text-strong inline-block max-w-full self-start truncate">
        {props.album.name || 'Unknown album'}
      </span>
    )
  }

  return (
    <div
      ref={(el) => (rowRef = el)}
      data-entity-row="true"
      tabIndex={-1}
      role="group"
      class={`${entityRowBaseClasses} grid grid-cols-[auto_1fr_85px_105px] items-center gap-4 text-sm select-none`}
      style={{height: `${ENTITY_ROW_HEIGHT}px`}}
      onKeyDown={handleRowKeyDown}
      onMouseDown={() => {
        rowRef?.focus()
        if (linkRef) linkRef.focus()
      }}
    >
      <span class="text-text-muted w-9 text-right">{props.index + 1}</span>
      <div class="flex min-w-0 flex-col gap-1">
        {albumNameNode}
        <span class="text-text-muted truncate text-sm">
          {props.album.uniqueTracksCount.toLocaleString()} tracks •{' '}
          {formatEntityLastPlayed(props.album.lastTs)}
        </span>
      </div>
      <div class="text-text flex items-center gap-1 tabular-nums">
        <span>{props.album.playsCount.toLocaleString()}</span>
        <span class="text-text-muted text-xs">plays</span>
      </div>
      <span class="text-text-muted text-right tabular-nums">
        {formatEntityDuration(props.album.playTimeMs)}
      </span>
    </div>
  )
}
