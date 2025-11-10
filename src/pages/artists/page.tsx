import {useGate} from 'effector-solid'
import {dateLib} from '@/shared/lib'
import {type ArtistListItem, ArtistSort} from '@/features/Magic'
import {
  EntityExplorer,
  type ColumnContext,
  type EntityExplorerColumn,
} from '@/features/EntityExplorer'
import {TotalStatsCard} from '@/features/Magic'
import {CollectionOverviewLayout} from '@/shared/ui'
import {ArtistsRangeChart} from './ArtistsRangeChart'
import {TopArtists} from './ArtistsStat'
import * as pageModel from './model'

const showRangeHoursColumn = ({timeRange}: ColumnContext<ArtistSort>) => {
  const range = timeRange()
  if (range.kind === 'range') return true
  return range.kind === 'fixed' ? range.value !== 'All' : false
}

const artistColumns: EntityExplorerColumn<ArtistListItem, ArtistSort>[] = [
  {
    key: 'name',
    width: 'minmax(0,1fr)',
    cellClass: 'text-text-strong truncate hov-decor',
    render: (artist) => <span>{artist.name}</span>,
  },
  {
    key: 'plays',
    width: 'var(--col-w)',
    align: 'center',
    header: 'Plays',
    render: (artist) => <span>{artist.range.plays}</span>,
  },
  {
    key: 'rangeHours',
    width: 'var(--col-w)',
    align: 'center',
    header: 'Range(h)',
    visible: showRangeHoursColumn,
    render: (artist) => <span>{`${dateLib.msToH(artist.range.ms)}h`}</span>,
  },
  {
    key: 'totalHours',
    width: 'var(--col-w)',
    align: 'center',
    header: 'Total(h)',
    render: (artist) => <span>{`${dateLib.msToH(artist.lifetime.ms)}h`}</span>,
  },
  {
    key: 'albums',
    width: '40px',
    align: 'center',
    header: 'Albums',
    render: (artist) => <span>{artist.lifetime.uniqueAlbums}</span>,
  },
  {
    key: 'tracks',
    width: '60px',
    align: 'center',
    header: 'Tracks',
    render: (artist) => <span>{artist.lifetime.uniqueTracks}</span>,
  },
]

const ArtistsPage = () => {
  useGate(pageModel.ArtistsPageGate)

  return (
    <CollectionOverviewLayout>
      <CollectionOverviewLayout.SidePanel>
        <CollectionOverviewLayout.SummaryGroup>
          <TotalStatsCard />
          <TopArtists />
        </CollectionOverviewLayout.SummaryGroup>

        <ArtistsRangeChart />
      </CollectionOverviewLayout.SidePanel>

      <CollectionOverviewLayout.MainPanel>
        <EntityExplorer
          model={pageModel.artistExplorerModel}
          columns={artistColumns}
          getRowHref={(artist) => `/artists/${encodeURIComponent(artist.name)}`}
          getRowKey={(artist) => artist.id}
          emptyState={<span>No artists found</span>}
        />
      </CollectionOverviewLayout.MainPanel>
    </CollectionOverviewLayout>
  )
}

export default ArtistsPage
