import {useUnit} from 'effector-solid'
import {Show} from 'solid-js'
import {Card, CardHeader, CardTitle} from '@/shared/ui/Card'
import {historyModel} from '@/features/Magic'
import {dateLib} from '@/shared/lib'
import {Metric} from '@/shared/ui/Metric'

export const TopTracks = () => {
  const info = useUnit(historyModel.$artistsInfo)
  const topByTime = () => info().top.trackByTime
  const topByPlays = () => info().top.trackByPlays

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Tracks</CardTitle>
      </CardHeader>

      <Show when={topByTime() && topByPlays()}>
        <div class="grid [grid-template-columns:repeat(2,minmax(0,1fr))] gap-4">
          <Metric>
            <Metric.Label>By Total Time</Metric.Label>
            <Metric.Title title={topByTime()!.trackName!}>{topByTime()!.trackName}</Metric.Title>
            <Metric.Sub class="animated-gradient-text">
              {dateLib.msToHMS(topByTime()!.totalMs)}
            </Metric.Sub>
          </Metric>

          <Metric>
            <Metric.Label>By Total Plays</Metric.Label>
            <Metric.Title title={topByPlays()!.trackName!}>{topByPlays()!.trackName}</Metric.Title>
            <Metric.Sub class="animated-gradient-text">
              {topByPlays()!.playsCount.toLocaleString()} plays
            </Metric.Sub>
          </Metric>
        </div>
      </Show>
    </Card>
  )
}
