export type StreamingEntry = {
  /** Timestamp when playback stopped (UTC, ISO 8601). */
  ts: string

  /** Platform used (OS, device, browser). */
  platform: string

  /** Number of milliseconds the item was played. */
  ms_played: number

  /** Country code where the stream was played (e.g. "NL"). */
  conn_country: string

  /** IP address used during playback. */
  ip_addr: string

  /** Track title (null if not a track). */
  master_metadata_track_name: string | null

  /** Artist, band, or podcast author (null if not applicable). */
  master_metadata_album_artist_name: string | null

  /** Album name (null if not a track). */
  master_metadata_album_album_name: string | null

  /** Spotify Track URI (null if not a track). */
  spotify_track_uri: string | null

  /** Podcast episode name (null if not a podcast). */
  episode_name: string | null

  /** Podcast show name (null if not a podcast). */
  episode_show_name: string | null

  /** Spotify Episode URI (null if not a podcast). */
  spotify_episode_uri: string | null

  /** Audiobook title (null if not an audiobook). */
  audiobook_title: string | null

  /** Audiobook URI (null if not an audiobook). */
  audiobook_uri: string | null

  /** Audiobook chapter URI (null if not an audiobook). */
  audiobook_chapter_uri: string | null

  /** Audiobook chapter title (null if not an audiobook). */
  audiobook_chapter_title: string | null

  /** Why playback started (e.g. "trackdone"). */
  reason_start: string

  /** Why playback ended (e.g. "trackdone", "endplay"). */
  reason_end: string

  /** True if shuffle mode was on. */
  shuffle: boolean

  /** True if user skipped to the next track. */
  skipped: boolean

  /** True if played in offline mode. */
  offline: boolean

  /** When offline mode was used (null if not offline). */
  offline_timestamp: string | null

  /** True if played in a private session. */
  incognito_mode: boolean

  // Optional fields (present in docs but not always exported)

  /** Your Spotify username (may not be included in every dump). */
  username?: string

  /** User agent string (browser, client info). */
  user_agent_decrypted?: string

  /** Alternate decrypted IP (doc variant). */
  ip_addr_decrypted?: string
}
