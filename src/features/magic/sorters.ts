import type {EnrichedAlbum, EnrichedTrack} from './types'

const defaultTrackName = (track: EnrichedTrack) => track.trackName ?? ''

type TrackSortKey = 'popularity' | 'playTime'

const trackComparators: Record<
  TrackSortKey,
  (a: EnrichedTrack, b: EnrichedTrack) => number
> = {
  popularity: (a, b) => {
    const byPlays = b.playsCount - a.playsCount
    if (byPlays !== 0) return byPlays
    const byTime = b.totalMs - a.totalMs
    if (byTime !== 0) return byTime
    return defaultTrackName(a).localeCompare(defaultTrackName(b))
  },
  playTime: (a, b) => {
    const byTime = b.totalMs - a.totalMs
    if (byTime !== 0) return byTime
    const byPlays = b.playsCount - a.playsCount
    if (byPlays !== 0) return byPlays
    return defaultTrackName(a).localeCompare(defaultTrackName(b))
  },
}

export const sortTracks = (
  tracks: readonly EnrichedTrack[],
  by: TrackSortKey,
): EnrichedTrack[] => {
  return tracks.slice().sort(trackComparators[by])
}

export const sortAlbumsByPlayCount = (
  albums: readonly EnrichedAlbum[],
): EnrichedAlbum[] => {
  return albums.slice().sort((albumA, albumB) => {
    const byPlays = albumB.playsCount - albumA.playsCount
    if (byPlays !== 0) return byPlays
    const byTime = albumB.playTimeMs - albumA.playTimeMs
    if (byTime !== 0) return byTime
    return albumA.name.localeCompare(albumB.name)
  })
}

export type {TrackSortKey}
