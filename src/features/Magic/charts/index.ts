import {ArtistChartMetrics, buildArtistChartSeries} from './artist'
import {AlbumChartMetrics, buildAlbumChartSeries} from './album'
import {buildTrackChartSeries} from './track'
import {MetricSelect} from './MetricSelect'

export const ChartsModel = {
  ArtistChartMetrics,
  buildArtistChartSeries,
  AlbumChartMetrics,
  buildAlbumChartSeries,
  buildTrackChartSeries,
  MetricSelect,
}

export type {ArtistChartMetric, ArtistChartSeries} from './artist'
export type {AlbumChartMetric, AlbumChartSeries} from './album'
export type {TrackChartSeries} from './track'
