import {useUnit} from 'effector-solid'
import {Show} from 'solid-js'
import {CardHeader, CardTitle, Card} from '@/shared/ui/Card'
import {dateLib} from '@/shared/lib'
import {historyModel} from '@/features/Magic'
import {Metric} from '@/shared/ui/Metric'

export const TopArtists = () => {
  const info = useUnit(historyModel.$artistsInfo)
  const topByTime = () => info().top.artistByTime
  const topByPlays = () => info().top.artistByPlays

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Artists</CardTitle>
      </CardHeader>

      <Show when={topByTime() && topByPlays()}>
        <div class="grid [grid-template-columns:repeat(2,minmax(0,1fr))] gap-4">
          <Metric>
            <Metric.Label>By Total Time</Metric.Label>
            <Metric.Title title={topByTime()!.name}>{topByTime()!.name}</Metric.Title>
            <Metric.Sub class="animated-gradient-text">
              {dateLib.msToHMS(topByTime()!.playTimeMs)}
            </Metric.Sub>
          </Metric>

          <Metric>
            <Metric.Label>By Total Plays</Metric.Label>
            <Metric.Title title={topByPlays()!.name}>{topByPlays()!.name}</Metric.Title>
            <Metric.Sub class="animated-gradient-text">
              {topByPlays()!.playsCount.toLocaleString()} plays
            </Metric.Sub>
          </Metric>
        </div>
      </Show>
    </Card>
  )
}
