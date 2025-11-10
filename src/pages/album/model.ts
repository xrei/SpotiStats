import {createEvent, restore, sample} from 'effector'
import {createGate} from 'effector-solid'
import {historyModel, sortTracks, Entities, type EnrichedAlbum} from '@/features/Magic'
import {createPeakActivityModel} from '@/features/PeakActivity'
import {dateLib} from '@/shared/lib'

export const AlbumPageGate = createGate<{artist: string; album: string}>('AlbumPageGate')

const albumDataChanged = createEvent<EnrichedAlbum | null>()
export const $albumData = restore(albumDataChanged, null)

sample({
  clock: AlbumPageGate.open,
  source: historyModel.$artistsTree,
  fn: (tree, {artist, album}) => {
    const artistEntry = tree[artist]
    if (!artistEntry) return null
    return artistEntry.albums[album] ?? null
  },
  target: albumDataChanged,
})

sample({
  clock: AlbumPageGate.close,
  fn: () => null,
  target: albumDataChanged,
})

export const $albumTracks = $albumData.map((album) => {
  if (!album) return []
  return sortTracks(album.tracks, 'playTime')
})

export type AlbumStats = {
  plays: string
  playTime: string
  tracksCount: number
  firstTs: string | null
  lastTs: string | null
}

export const $albumStats = $albumData.map<AlbumStats>((album) => {
  if (!album) {
    return {
      plays: '0',
      playTime: '0h 00m 00s',
      tracksCount: 0,
      firstTs: null,
      lastTs: null,
    }
  }

  return {
    plays: album.playsCount.toLocaleString(),
    playTime: dateLib.msToHMS(album.playTimeMs),
    tracksCount: album.uniqueTracksCount,
    firstTs: album.firstTs,
    lastTs: album.lastTs,
  }
})

export const albumPeakActivityModel = createPeakActivityModel(Entities.Album)

sample({
  clock: albumDataChanged,
  target: albumPeakActivityModel.entityChanged,
})
