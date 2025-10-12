import type {StreamingEntry} from '../data/entry'
import type {AlbumTree, ArtistTree, EnrichedTrack, TimeIndex} from '../types'
import {
  getEntryKind,
  addToIndex,
  albumKeyOf,
  updateTrackFromEntry,
  upsertAlbum,
  upsertArtist,
  upsertTrack,
  updateTimeRange,
  summariseEntities,
} from './lib'

type AggregateOptions = {
  minMsToCount?: number
  includePodcasts?: boolean
  includeAudiobooks?: boolean
}

export const aggregateStreamingHistory = (
  data: StreamingEntry[][],
  opts: AggregateOptions = {},
) => {
  const {minMsToCount = 0, includePodcasts = false, includeAudiobooks = false} = opts

  const byTrack = new Map<string, EnrichedTrack>()
  const artists: ArtistTree = Object.create(null)
  const albums: AlbumTree = Object.create(null)

  const timeIndex: TimeIndex = {
    artistsByDay: new Map(),
    artistsByMonth: new Map(),
    albumsByDay: new Map(),
    albumsByMonth: new Map(),
    tracksByDay: new Map(),
    tracksByMonth: new Map(),
    minDay: null,
    maxDay: null,
  }

  const agg = (entry: StreamingEntry) => {
    const {isAudiobook, isPodcast, isTrack} = getEntryKind(entry)
    const msPlayed = entry.ms_played

    if (!isTrack && !isPodcast && !isAudiobook) return
    if (isPodcast && !includePodcasts) return
    if (isAudiobook && !includeAudiobooks) return
    if (msPlayed < minMsToCount) return

    const artistName = entry.master_metadata_album_artist_name ?? '(Unknown Artist)'
    const albumName = entry.master_metadata_album_album_name ?? '(Unknown Album)'

    const id =
      entry.spotify_track_uri ??
      (isPodcast
        ? `episode:${entry.episode_show_name ?? ''}:${entry.episode_name ?? ''}`
        : isAudiobook
          ? `audiobook:${entry.audiobook_title ?? ''}:${entry.audiobook_chapter_title ?? ''}`
          : `track:${entry.master_metadata_track_name ?? ''}:${artistName}:${albumName}`)

    const albumId = albumKeyOf(artistName, albumName)

    const artist = upsertArtist(artists, artistName)
    const album = upsertAlbum(artist, albumName, albumId)
    albums[albumId] = album
    const track = upsertTrack(byTrack, artist, album, id, entry)

    updateTrackFromEntry(track, entry)
    album.playsCount += 1
    artist.playsCount += 1
    album.playTimeMs += msPlayed
    artist.playTimeMs += msPlayed
    updateTimeRange(album, entry.ts)
    updateTimeRange(artist, entry.ts)

    const day = entry.ts.slice(0, 10) // 'YYYY-MM-DD'
    const month = entry.ts.slice(0, 7) // 'YYYY-MM'
    addToIndex(timeIndex.artistsByDay, day, artistName, msPlayed)
    addToIndex(timeIndex.artistsByMonth, month, artistName, msPlayed)
    addToIndex(timeIndex.albumsByDay, day, albumId, msPlayed)
    addToIndex(timeIndex.albumsByMonth, month, albumId, msPlayed)
    addToIndex(timeIndex.tracksByDay, day, track.id, msPlayed)
    addToIndex(timeIndex.tracksByMonth, month, track.id, msPlayed)

    if (timeIndex.minDay === null || day < timeIndex.minDay) timeIndex.minDay = day
    if (timeIndex.maxDay === null || day > timeIndex.maxDay) timeIndex.maxDay = day
  }

  for (const chunk of data) for (const e of chunk) agg(e)

  const summary = summariseEntities(artists, byTrack)

  for (const t of byTrack.values()) t.timestamps.sort()

  return {
    artists,
    albums,
    byTrack,
    summary,
    timeIndex,
  }
}

export type HistoryData = ReturnType<typeof aggregateStreamingHistory>
