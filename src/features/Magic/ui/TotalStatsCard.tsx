import {useUnit} from 'effector-solid'
import {Card, CardHeader, CardTitle} from '@/shared/ui/Card'
import {Metric} from '@/shared/ui/Metric'
import {dateLib} from '@/shared/lib'
import {historyModel} from '../model'

export const TotalStatsCard = () => {
  const info = useUnit(historyModel.$artistsInfo)
  const totalDays = () =>
    Math.round(info().totalPlayedTimeMs / 86_400_000).toLocaleString()
  const totalArtists = () => info().totalArtists.toLocaleString()
  const totalAlbums = () => info().totalAlbums.toLocaleString()
  const totalTracks = () => info().uniqueTracksCount.toLocaleString()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall</CardTitle>
      </CardHeader>
      <div class="grid grid-cols-3 gap-4">
        <Metric class="col-span-2">
          <Metric.Label>Total Play Time</Metric.Label>
          <Metric.Value class="animated-gradient-text" size="hero">
            {dateLib.msToHMS(info().totalPlayedTimeMs)}
          </Metric.Value>
        </Metric>

        <Metric class="col-span-1">
          <Metric.Label>Unique Tracks</Metric.Label>
          <Metric.Value>{totalTracks()}</Metric.Value>
        </Metric>

        <Metric>
          <Metric.Label>Total Days</Metric.Label>
          <Metric.Value>{totalDays()}</Metric.Value>
        </Metric>

        <Metric>
          <Metric.Label>Total Artists</Metric.Label>
          <Metric.Value>{totalArtists()}</Metric.Value>
        </Metric>

        <Metric>
          <Metric.Label>Total Albums</Metric.Label>
          <Metric.Value>{totalAlbums()}</Metric.Value>
        </Metric>
      </div>
    </Card>
  )
}
