import type {StreamingEntry} from '../data/entry'
import type {
  ArtistTree,
  EnrichedArtist,
  EnrichedAlbum,
  EnrichedTrack,
  CountAgg,
  EntitiesSummary,
} from '../types'

export const createTrack = (id: string, e: StreamingEntry): EnrichedTrack => ({
  id,
  timestamps: [],
  firstTs: null,
  lastTs: null,
  playsCount: 0,
  totalMs: 0,
  trackName: e.master_metadata_track_name,
  artistName: e.master_metadata_album_artist_name,
  albumName: e.master_metadata_album_album_name,
  meta: {
    platforms: Object.create(null),
    countries: Object.create(null),
    reasonStart: Object.create(null),
    reasonEnd: Object.create(null),
    shuffleTrue: 0,
    skippedTrue: 0,
    offlineTrue: 0,
    incognitoTrue: 0,
  },
})

export const createAlbum = (
  id: string,
  name: string,
  artistName: string,
): EnrichedAlbum => ({
  id,
  name,
  artistName,
  tracks: [],
  uniqueTracksCount: 0,
  playsCount: 0,
  playTimeMs: 0,
  firstTs: null,
  lastTs: null,
})

export const createArtist = (name: string): EnrichedArtist => ({
  name,
  albums: Object.create(null),
  uniqueTracksCount: 0,
  uniqueAlbumsCount: 0,
  playsCount: 0,
  playTimeMs: 0,
  firstTs: null,
  lastTs: null,
})

export const upsertArtist = (tree: ArtistTree, name: string): EnrichedArtist => {
  let a = tree[name]
  if (!a) {
    a = createArtist(name)
    tree[name] = a
  }
  return a
}

export const upsertAlbum = (
  artist: EnrichedArtist,
  name: string,
  albumId: string,
): EnrichedAlbum => {
  let al = artist.albums[name]
  if (!al) {
    al = createAlbum(albumId, name, artist.name)
    artist.albums[name] = al
    artist.uniqueAlbumsCount += 1
  }
  return al
}

export const upsertTrack = (
  tracks: Map<string, EnrichedTrack>,
  artist: EnrichedArtist,
  album: EnrichedAlbum,
  id: string,
  entry: StreamingEntry,
): EnrichedTrack => {
  let t = tracks.get(id)
  if (!t) {
    t = createTrack(id, entry)
    tracks.set(id, t)
    album.tracks.push(t)
    album.uniqueTracksCount += 1
    artist.uniqueTracksCount += 1
  }
  return t
}

export const updateTimeRange = (
  target: {firstTs: string | null; lastTs: string | null},
  ts: string,
) => {
  if (target.firstTs === null || ts < target.firstTs) target.firstTs = ts
  if (target.lastTs === null || ts > target.lastTs) target.lastTs = ts
}

export const updateTrackFromEntry = (t: EnrichedTrack, e: StreamingEntry) => {
  t.playsCount += 1
  t.totalMs += e.ms_played
  t.timestamps.push(e.ts)
  updateTimeRange(t, e.ts)

  t.meta.platforms[e.platform] = (t.meta.platforms[e.platform] ?? 0) + 1
  t.meta.countries[e.conn_country] = (t.meta.countries[e.conn_country] ?? 0) + 1
  t.meta.reasonStart[e.reason_start] = (t.meta.reasonStart[e.reason_start] ?? 0) + 1
  t.meta.reasonEnd[e.reason_end] = (t.meta.reasonEnd[e.reason_end] ?? 0) + 1
  if (e.shuffle) t.meta.shuffleTrue += 1
  if (e.skipped) t.meta.skippedTrue += 1
  if (e.offline) t.meta.offlineTrue += 1
  if (e.incognito_mode) t.meta.incognitoTrue += 1
}

export const addToIndex = (
  idx: Map<string, Map<string, CountAgg>>,
  key: string,
  entityId: string,
  ms: number,
) => {
  let map = idx.get(key)
  if (!map) {
    map = new Map()
    idx.set(key, map)
  }
  const agg = map.get(entityId)
  if (agg) {
    agg.ms += ms
    agg.plays += 1
  } else {
    map.set(entityId, {ms, plays: 1})
  }
}

export const albumKeyOf = (artistName: string, albumName: string) =>
  `${artistName}::${albumName}`

export const getEntryKind = (entry: StreamingEntry) => {
  const isTrack = !!entry.spotify_track_uri || !!entry.master_metadata_track_name
  const isPodcast = !!entry.spotify_episode_uri || !!entry.episode_name
  const isAudiobook = !!entry.audiobook_uri || !!entry.audiobook_title
  return {isTrack, isPodcast, isAudiobook}
}

export function summariseEntities(
  tree: ArtistTree,
  byTrack: Map<string, EnrichedTrack>,
): EntitiesSummary {
  let totalAlbums = 0
  let totalPlayedTimeMs = 0
  let artistByPlays: EnrichedArtist | null = null
  let artistByTime: EnrichedArtist | null = null
  let albumByPlays: EnrichedAlbum | null = null
  let albumByTime: EnrichedAlbum | null = null
  let trackByPlays: EnrichedTrack | null = null
  let trackByTime: EnrichedTrack | null = null

  for (const artist of Object.values(tree)) {
    artistByPlays = topByPlays(artistByPlays, artist)
    artistByTime = topByTime(artistByTime, artist)

    for (const album of Object.values(artist.albums)) {
      totalAlbums += 1
      albumByPlays = topByPlays(albumByPlays, album)
      albumByTime = topByTime(albumByTime, album)
    }
  }

  for (const track of byTrack.values()) {
    trackByPlays = topByPlays(trackByPlays, track)
    trackByTime = topByTotalMs(trackByTime, track)
    totalPlayedTimeMs += track.totalMs
  }

  return {
    top: {
      artistByPlays,
      artistByTime,
      albumByPlays,
      albumByTime,
      trackByPlays,
      trackByTime,
    },
    totalArtists: Object.keys(tree).length,
    totalAlbums,
    totalPlayedTimeMs,
    uniqueTracksCount: byTrack.size,
  }
}

const topByPlays = <T extends {playsCount: number}>(
  curr: T | null,
  item: T,
): T | null => {
  if (!curr || item.playsCount > curr.playsCount) return item
  return curr
}

const topByTime = <T extends {playTimeMs: number}>(curr: T | null, item: T): T | null => {
  if (!curr || item.playTimeMs > curr.playTimeMs) return item
  return curr
}

const topByTotalMs = <T extends {totalMs: number}>(curr: T | null, item: T): T | null => {
  if (!curr || item.totalMs > curr.totalMs) return item
  return curr
}
