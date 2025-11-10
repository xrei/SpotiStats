import {createStore, sample} from 'effector'
import {createGate} from 'effector-solid'
import {createEntityExplorerModel} from '@/features/EntityExplorer'
import {
  ChartsModel,
  createSelect,
  historyModel,
  trackView,
  TrackSort,
} from '@/features/Magic'
import type {TrackChartSeries} from '@/features/Magic'
import {TrackSortOpts} from './sortOptions'

const {select: selectTracks} = createSelect(trackView)

export const TracksPageGate = createGate()

export const trackExplorerModel = createEntityExplorerModel({
  gate: TracksPageGate,
  sortOptions: TrackSortOpts,
  defaultSort: TrackSort.RangePlays,
  sources: {
    data: historyModel.$tracksMap,
    timeIndex: historyModel.$timeIndex,
  },
  select: selectTracks,
})

const filtersModel = trackExplorerModel.filtersModel

export const $chartData = createStore<TrackChartSeries>({
  series: [],
  granularity: 'day',
})

sample({
  clock: [TracksPageGate.open, filtersModel.TimeRange.$timeRange],
  source: {
    ix: historyModel.$timeIndex,
    range: filtersModel.TimeRange.$timeRange,
  },
  fn: ({ix, range}) => ChartsModel.buildTrackChartSeries(ix, range),
  target: $chartData,
})

$chartData.reset(TracksPageGate.close)
