import {createEvent, createStore, restore, sample} from 'effector'
import {createGate} from 'effector-solid'
import {
  historyModel,
  sortAlbumsByPlayCount,
  sortTracks,
  Entities,
  type EnrichedArtist,
  type EnrichedTrack,
} from '@/features/Magic'
import {createPeakActivityModel} from '@/features/PeakActivity'
import {dateLib} from '@/shared/lib'

export const ArtistPageGate = createGate<{artist: string}>('ArtistPageGate')

const artistDataChanged = createEvent<EnrichedArtist | null>()
export const $artistData = restore(artistDataChanged, null)

sample({
  clock: ArtistPageGate.open,
  source: historyModel.$artistsTree,
  fn: (tree, {artist}) => {
    return tree[artist] || null
  },
  target: artistDataChanged,
})

export const $popularTracks = createStore<EnrichedTrack[]>([])

sample({
  source: $artistData,
  fn: (artist) => {
    if (!artist) return []
    const tracks: EnrichedTrack[] = []
    for (const album of Object.values(artist.albums)) tracks.push(...album.tracks)
    return sortTracks(tracks, 'popularity').slice(0, 20)
  },
  target: $popularTracks,
})

export const $albums = $artistData.map((a) => {
  if (!a) return []
  return sortAlbumsByPlayCount(Object.values(a.albums))
})

export const $totalStats = $artistData.map((artist) => {
  if (!artist) return {plays: 0, hours: '0h 00m 00s'}
  return {
    plays: artist.playsCount.toLocaleString(),
    hours: dateLib.msToHMS(artist.playTimeMs),
  }
})

export const artistPeakActivityModel = createPeakActivityModel(Entities.Artist)

sample({
  clock: artistDataChanged,
  target: artistPeakActivityModel.entityChanged,
})

sample({
  clock: ArtistPageGate.close,
  target: [$artistData.reinit, $popularTracks.reinit, artistPeakActivityModel.reset],
})
