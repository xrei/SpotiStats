import type {EnrichedTrack} from '@/features/Magic'
import type {Accessor} from 'solid-js'
import {EntityShowMoreList, TrackListRow} from '@/features/EntitiesUI'

export const TracksSection = (props: {tracks: Accessor<readonly EnrichedTrack[]>}) => (
  <EntityShowMoreList
    title="Top Tracks"
    items={props.tracks}
    emptyLabel="No tracks found."
    collapsedLabel="Show more"
    expandedLabel="Show less"
    maxItems={20}
    minItemsToToggle={5}
    renderItem={(track, index) => <TrackListRow track={track} index={index} />}
  />
)
