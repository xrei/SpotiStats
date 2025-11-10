import type {EnrichedAlbum} from '@/features/Magic'
import type {Accessor} from 'solid-js'
import {AlbumListRow, EntityShowMoreList} from '@/features/EntitiesUI'

export const AlbumSection = (props: {albums: Accessor<readonly EnrichedAlbum[]>}) => (
  <EntityShowMoreList
    title="Albums"
    items={props.albums}
    emptyLabel="No albums found."
    collapsedLabel="Show all"
    expandedLabel="Show less"
    collapsedCount={10}
    expandedCount={10}
    minItemsToToggle={10}
    renderItem={(album, index) => <AlbumListRow album={album} index={index} />}
  />
)
