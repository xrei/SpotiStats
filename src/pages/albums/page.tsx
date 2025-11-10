import {useGate} from 'effector-solid'
import {dateLib} from '@/shared/lib'
import {type AlbumListItem, type AlbumSort} from '@/features/Magic'
import {
  EntityExplorer,
  type ColumnContext,
  type EntityExplorerColumn,
} from '@/features/EntityExplorer'
import {TotalStatsCard} from '@/features/Magic'
import {CollectionOverviewLayout} from '@/shared/ui'
import {TopAlbums} from './AlbumsStat'
import {AlbumsRangeChart} from './AlbumsRangeChart'
import * as pageModel from './model'
import {A} from '@solidjs/router'

const showRangeColumn = ({timeRange}: ColumnContext<AlbumSort>) => {
  const range = timeRange()
  if (range.kind === 'range') return true
  return range.kind === 'fixed' ? range.value !== 'All' : false
}

const albumColumns: EntityExplorerColumn<AlbumListItem, AlbumSort>[] = [
  {
    key: 'album',
    width: 'minmax(0,1fr)',
    cellClass: 'text-text-strong truncate',
    render: (album) => (
      <div class="flex flex-col gap-1">
        <A href={`/artists/${album.artistName}/${album.name}`} class="hov-decor">
          {album.name}
        </A>
        <A href={`/artists/${album.artistName}`} class="text-text-dim hov-decor text-xs">
          {album.artistName}
        </A>
      </div>
    ),
  },
  {
    key: 'plays',
    width: 'var(--col-w)',
    align: 'center',
    header: 'Plays',
    render: (album) => <span>{album.range.plays}</span>,
  },
  {
    key: 'rangeHours',
    width: 'var(--col-w)',
    align: 'center',
    header: 'Range(h)',
    visible: showRangeColumn,
    render: (album) => <span>{`${dateLib.msToH(album.range.ms)}h`}</span>,
  },
  {
    key: 'totalHours',
    width: 'var(--col-w)',
    align: 'center',
    header: 'Total(h)',
    render: (album) => <span>{`${dateLib.msToH(album.lifetime.ms)}h`}</span>,
  },
  {
    key: 'tracks',
    width: 'var(--col-w)',
    align: 'center',
    header: 'Tracks',
    render: (album) => <span>{album.lifetime.uniqueTracks}</span>,
  },
]

const AlbumsPage = () => {
  useGate(pageModel.AlbumsPageGate)

  return (
    <CollectionOverviewLayout>
      <CollectionOverviewLayout.SidePanel>
        <CollectionOverviewLayout.SummaryGroup>
          <TotalStatsCard />
          <TopAlbums />
        </CollectionOverviewLayout.SummaryGroup>

        <AlbumsRangeChart />
      </CollectionOverviewLayout.SidePanel>

      <CollectionOverviewLayout.MainPanel>
        <EntityExplorer
          model={pageModel.albumExplorerModel}
          columns={albumColumns}
          getRowKey={(album) => album.id}
          emptyState={<span>No albums found</span>}
          estimateSize={56}
          searchPlaceholder="Search albums..."
        />
      </CollectionOverviewLayout.MainPanel>
    </CollectionOverviewLayout>
  )
}

export default AlbumsPage
