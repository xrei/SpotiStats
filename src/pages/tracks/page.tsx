import {useGate} from 'effector-solid'
import {A} from '@solidjs/router'
import {dateLib} from '@/shared/lib'
import {type TrackListItem, TrackSort} from '@/features/magic'
import {EntityExplorer, type EntityExplorerColumn} from '@/features/entityExplorer'
import {TotalStatsCard} from '@/features/magic'
import {CollectionOverviewLayout} from '@/shared/ui'
import {TracksRangeChart} from './TracksRangeChart'
import {TopTracks} from './TracksStat'
import * as pageModel from './model'

const trackColumns: EntityExplorerColumn<TrackListItem, TrackSort>[] = [
  {
    key: 'track',
    width: 'minmax(0,1fr)',
    cellClass: 'text-text-strong truncate',
    render: (t) => (
      <div class="flex flex-col gap-1">
        <A href={`/artists/${t.artistName}/${t.albumName}/${t.name}`} class="hov-decor">
          {t.name}
        </A>
        <A href={`/artists/${t.artistName}`} class="text-text-dim hov-decor text-xs">
          {t.artistName}
        </A>
      </div>
    ),
  },
  {
    key: 'album',
    width: 'minmax(0,1fr)',
    cellClass: 'text-text-strong truncate',
    header: 'Album',
    align: 'left',
    render: (track) => <span>{track.albumName ?? 'Unknown album'}</span>,
  },
  {
    key: 'rangePlays',
    width: 'var(--col-w)',
    align: 'center',
    header: 'Plays',
    render: (track) => <span>{track.range.plays}</span>,
  },
  {
    key: 'rangeMs',
    width: 'var(--col-w)',
    align: 'center',
    header: 'Total(h)',
    render: (track) => <span>{dateLib.msToH(track.range.ms)}h</span>,
  },
]

const TracksPage = () => {
  useGate(pageModel.TracksPageGate)

  return (
    <CollectionOverviewLayout>
      <CollectionOverviewLayout.SidePanel>
        <CollectionOverviewLayout.SummaryGroup>
          <TotalStatsCard />
          <TopTracks />
        </CollectionOverviewLayout.SummaryGroup>

        <TracksRangeChart />
      </CollectionOverviewLayout.SidePanel>

      <CollectionOverviewLayout.MainPanel>
        <EntityExplorer
          model={pageModel.trackExplorerModel}
          columns={trackColumns}
          getRowKey={(track) => track.id}
          emptyState={<span>No tracks found</span>}
          estimateSize={56}
          searchPlaceholder="Search tracks..."
        />
      </CollectionOverviewLayout.MainPanel>
    </CollectionOverviewLayout>
  )
}

export default TracksPage
