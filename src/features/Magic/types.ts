export type EnrichedTrack = {
  id: string
  timestamps: string[]
  firstTs: string | null
  lastTs: string | null
  playsCount: number
  totalMs: number

  trackName: string | null
  artistName: string | null
  albumName: string | null

  meta: {
    platforms: Record<string, number>
    countries: Record<string, number>
    reasonStart: Record<string, number>
    reasonEnd: Record<string, number>
    shuffleTrue: number
    skippedTrue: number
    offlineTrue: number
    incognitoTrue: number
  }
}

export type EnrichedAlbum = {
  id: string
  name: string
  artistName: string
  tracks: EnrichedTrack[]
  uniqueTracksCount: number
  playsCount: number
  playTimeMs: number
  firstTs: string | null
  lastTs: string | null
}

export type EnrichedArtist = {
  name: string
  albums: Record<string, EnrichedAlbum>
  uniqueTracksCount: number
  uniqueAlbumsCount: number
  playsCount: number
  playTimeMs: number
  firstTs: string | null
  lastTs: string | null
}

export type ArtistTree = Record<string, EnrichedArtist>

export type AlbumTree = Record<string, EnrichedAlbum>

/**  'YYYY-MM-DD' */
export type DayKey = string
/** 'YYYY-MM' */
export type MonthKey = string
export type CountAgg = {ms: number; plays: number}
export type MergedAgg = {
  ms: number
  plays: number
  firstKey: string | null
  lastKey: string | null
}

export type Granularity = 'day' | 'month'

export type TimeIndex = {
  artistsByDay: Map<DayKey, Map<string, CountAgg>>
  artistsByMonth: Map<MonthKey, Map<string, CountAgg>>
  albumsByDay: Map<DayKey, Map<string, CountAgg>>
  albumsByMonth: Map<MonthKey, Map<string, CountAgg>>
  tracksByDay: Map<DayKey, Map<string, CountAgg>>
  tracksByMonth: Map<MonthKey, Map<string, CountAgg>>
  minDay: DayKey | null
  maxDay: DayKey | null
}

export type EntitiesSummary = {
  top: TopEntities
  totalArtists: number
  totalAlbums: number
  uniqueTracksCount: number
  totalPlayedTimeMs: number
}

export type TopEntities = {
  artistByPlays: EnrichedArtist | null
  artistByTime: EnrichedArtist | null
  albumByPlays: EnrichedAlbum | null
  albumByTime: EnrichedAlbum | null
  trackByPlays: EnrichedTrack | null
  trackByTime: EnrichedTrack | null
}

export type ArtistListItem = {
  id: string
  name: string
  lifetime: {
    uniqueTracks: number
    uniqueAlbums: number
    plays: number
    ms: number
    firstTs: string | null
    lastTs: string | null
  }
  range: {
    ms: number
    plays: number
    firstKey: string | null
    lastKey: string | null
    granularity: Granularity
  }
}

export type AlbumListItem = {
  id: string
  name: string
  artistName: string
  lifetime: {
    uniqueTracks: number
    plays: number
    ms: number
    firstTs: string | null
    lastTs: string | null
  }
  range: {
    ms: number
    plays: number
    firstKey: string | null
    lastKey: string | null
    granularity: Granularity
  }
}

export type TrackListItem = {
  id: string
  name: string | null
  artistName: string | null
  albumName: string | null
  lifetime: {
    plays: number
    ms: number
    firstTs: string | null
    lastTs: string | null
  }
  range: {
    ms: number
    plays: number
    firstKey: string | null
    lastKey: string | null
    granularity: Granularity
  }
  meta: EnrichedTrack['meta']
}

export type EntityType = 'album' | 'artist' | 'track'

export type Entity = EnrichedAlbum | EnrichedArtist | EnrichedTrack
