import {createEvent, createStore, sample} from 'effector'
import {createGate} from 'effector-solid'
import {createEntityExplorerModel} from '@/features/entityExplorer'
import {ArtistSortOpts} from './sortOptions'
import {ArtistSort, artistView, ChartsModel, createSelect, historyModel} from '@/features/magic'
import type {ArtistChartMetric, ArtistChartSeries} from '@/features/magic'

const {select: selectArtists} = createSelect(artistView)

export const ArtistsPageGate = createGate()

export const artistExplorerModel = createEntityExplorerModel({
  gate: ArtistsPageGate,
  sortOptions: ArtistSortOpts,
  defaultSort: ArtistSort.RangePlays,
  sources: {
    data: historyModel.$artistsTree,
    timeIndex: historyModel.$timeIndex,
  },
  select: selectArtists,
})

const filtersModel = artistExplorerModel.filtersModel

export const $chartMetric = createStore<ArtistChartMetric>('artists')
export const chartMetricChanged = createEvent<ArtistChartMetric>()

sample({
  clock: chartMetricChanged,
  target: $chartMetric,
})

export const $chartData = createStore<ArtistChartSeries>({
  series: [],
  granularity: 'day',
})

$chartData.reset(ArtistsPageGate.close)

sample({
  source: {
    metric: $chartMetric,
    ix: historyModel.$timeIndex,
    range: filtersModel.TimeRange.$timeRange,
  },
  fn: ({ix, metric, range}) => ChartsModel.buildArtistChartSeries(ix, range, metric),
  target: $chartData,
})

sample({
  clock: ArtistsPageGate.open,
  source: {
    metric: $chartMetric,
    ix: historyModel.$timeIndex,
    range: filtersModel.TimeRange.$timeRange,
  },
  fn: ({ix, metric, range}) => ChartsModel.buildArtistChartSeries(ix, range, metric),
  target: $chartData,
})
