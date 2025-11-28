import {createEffect, createStore, createEvent, sample} from 'effector'
import {loadData} from './data'
import type {StreamingEntry} from './data/entry'
import {aggregateStreamingHistory, type HistoryData} from './aggregator'
import {loadPersistedDataFx, uploadFilesFx, $hasPersistedData} from './dataLoader'

const $rawData = createStore<StreamingEntry[][]>([])

const clearRawData = createEvent<void>('clear raw data')

const loadDataFx = createEffect(async () => {
  const data = await loadData()
  return data
})

sample({
  clock: loadDataFx.doneData,
  target: $rawData,
})

sample({
  clock: loadPersistedDataFx.doneData,
  filter: (data: StreamingEntry[][]) => data.length > 0,
  target: $rawData,
})

sample({
  clock: uploadFilesFx.doneData,
  fn: (result) => [result.entries],
  target: $rawData,
})

sample({
  clock: clearRawData,
  fn: () => [],
  target: $rawData,
})

const $history = createStore<HistoryData>({
  artists: {},
  albums: {},
  byTrack: new Map(),
  summary: {
    top: {
      artistByPlays: null,
      artistByTime: null,
      albumByPlays: null,
      albumByTime: null,
      trackByPlays: null,
      trackByTime: null,
    },
    totalArtists: 0,
    totalAlbums: 0,
    totalPlayedTimeMs: 0,
    uniqueTracksCount: 0,
  },
  timeIndex: {
    artistsByDay: new Map(),
    artistsByMonth: new Map(),
    albumsByDay: new Map(),
    albumsByMonth: new Map(),
    tracksByDay: new Map(),
    tracksByMonth: new Map(),
    minDay: null,
    maxDay: null,
  },
})

const $timeIndex = $history.map((h) => h.timeIndex)
const $artistsTree = $history.map((h) => h.artists)
const $albumsTree = $history.map((h) => h.albums)
const $tracksMap = $history.map((h) => h.byTrack)

sample({
  clock: $rawData,
  filter: (data) => data.length > 0,
  fn: (data) => aggregateStreamingHistory(data),
  target: $history,
})

sample({
  clock: $history,
  target: clearRawData,
})

const $artistsInfo = $history.map((h) => h.summary)

// loadDataFx - dev only, silent failure (just log)
sample({
  clock: loadDataFx.fail,
  fn: ({error}) => {
    console.error('Failed to load dev data:', error)
  },
})

export const historyModel = {
  loadDataFx,
  $history,
  $artistsInfo,
  $timeIndex,
  $artistsTree,
  $albumsTree,
  $tracksMap,
  $rawData,
  $hasPersistedData,
}
