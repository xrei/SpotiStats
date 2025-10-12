import {createEvent, createStore, restore, sample} from 'effector'
import {createGate} from 'effector-solid'
import {historyModel, type EnrichedArtist, type EnrichedTrack} from '@/features/magic'
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

sample({
  clock: ArtistPageGate.close,
  fn: () => null,
  target: artistDataChanged,
})

export const $popularTracks = createStore<EnrichedTrack[]>([])

$popularTracks.reset(ArtistPageGate.close)

sample({
  source: $artistData,
  fn: (artist) => {
    if (!artist) return []
    const tracks: EnrichedTrack[] = []
    for (const album of Object.values(artist.albums)) tracks.push(...album.tracks)
    return tracks
      .slice()
      .sort((a, b) => {
        const byPlays = b.playsCount - a.playsCount
        if (byPlays !== 0) return byPlays
        const byTime = b.totalMs - a.totalMs
        if (byTime !== 0) return byTime
        return (a.trackName ?? '').localeCompare(b.trackName ?? '')
      })
      .slice(0, 20)
  },
  target: $popularTracks,
})

export const $albums = $artistData.map((a) => {
  if (!a) return []
  const albums = Object.values(a.albums)
  const getTs = (ts: string | null) => {
    if (!ts) return Number.NEGATIVE_INFINITY
    const value = Date.parse(ts)
    if (Number.isNaN(value)) return Number.NEGATIVE_INFINITY
    return value
  }
  return albums
    .slice()
    .sort((albumA, albumB) => {
      const byLastPlayed = getTs(albumB.lastTs) - getTs(albumA.lastTs)
      if (byLastPlayed !== 0) return byLastPlayed
      const byPlays = albumB.playsCount - albumA.playsCount
      if (byPlays !== 0) return byPlays
      return albumA.name.localeCompare(albumB.name)
    })
})

export const $totalStats = $artistData.map((artist) => {
  if (!artist) return {plays: 0, hours: '0h 00m 00s'}
  return {
    plays: artist.playsCount.toLocaleString(),
    hours: dateLib.msToHMS(artist.playTimeMs),
  }
})
