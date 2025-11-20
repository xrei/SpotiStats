import {createEvent, createStore, sample} from 'effector'
import {createGate} from 'effector-solid'
import {createEntityExplorerModel} from '@/features/EntityExplorer'
import {
  AlbumSort,
  albumView,
  ChartsModel,
  createSelect,
  historyModel,
} from '@/features/Magic'
import type {AlbumChartMetric, AlbumChartSeries} from '@/features/Magic'
import {AlbumSortOpts} from './sortOptions'

const {select: selectAlbums} = createSelect(albumView)

export const AlbumsPageGate = createGate()

export const albumExplorerModel = createEntityExplorerModel({
  gate: AlbumsPageGate,
  sortOptions: AlbumSortOpts,
  defaultSort: AlbumSort.RangeMs,
  sources: {
    data: historyModel.$albumsTree,
    timeIndex: historyModel.$timeIndex,
  },
  select: selectAlbums,
})

const filtersModel = albumExplorerModel.filtersModel

export const $chartMetric = createStore<AlbumChartMetric>('albums')
export const chartMetricChanged = createEvent<AlbumChartMetric>()

sample({
  clock: chartMetricChanged,
  target: $chartMetric,
})

export const $chartData = createStore<AlbumChartSeries>({
  series: [],
  granularity: 'day',
})

$chartData.reset(AlbumsPageGate.close)

sample({
  source: {
    metric: $chartMetric,
    ix: historyModel.$timeIndex,
    range: filtersModel.TimeRange.$timeRange,
  },
  fn: ({ix, metric, range}) => ChartsModel.buildAlbumChartSeries(ix, range, metric),
  target: $chartData,
})

sample({
  clock: AlbumsPageGate.open,
  source: {
    metric: $chartMetric,
    ix: historyModel.$timeIndex,
    range: filtersModel.TimeRange.$timeRange,
  },
  fn: ({ix, metric, range}) => ChartsModel.buildAlbumChartSeries(ix, range, metric),
  target: $chartData,
})
