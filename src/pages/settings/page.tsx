import {useGate, useUnit} from 'effector-solid'
import {Card} from '@/shared/ui/Card'
import {historyModel} from '@/features/Magic'
import {dateLib} from '@/shared/lib'
import {SettingsPageGate, $storageStats, clearData, clearPersistedDataFx} from './model'

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (isoString: string): string => {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const SettingsPage = () => {
  useGate(SettingsPageGate)

  const [stats, isClearing, artistsInfo, timeIndex] = useUnit([
    $storageStats,
    clearPersistedDataFx.pending,
    historyModel.$artistsInfo,
    historyModel.$timeIndex,
  ])

  const handleClearData = () => {
    if (confirm('Permanently delete all your uploaded data?\n\nThis cannot be undone.')) {
      clearData()
    }
  }

  const s = () => stats()
  const placeholder = '—'

  return (
    <div class="mx-auto w-full max-w-2xl px-5 py-8">
      <h1 class="text-text-strong mb-6 text-2xl font-bold">Manage your data</h1>

      <div class="flex flex-col gap-6">
        <Card>
          <h2 class="text-text-strong text-lg font-semibold">Your data</h2>
          <div class="grid grid-cols-2 gap-4">
            <StatRow
              label="Entries"
              value={s()?.entryCount.toLocaleString() ?? placeholder}
            />
            <StatRow
              label="Estimated size"
              value={s() ? formatBytes(s()!.estimatedSizeBytes) : placeholder}
            />
            <StatRow
              label="Total listening time"
              value={
                artistsInfo().totalPlayedTimeMs
                  ? dateLib.msToHMS(artistsInfo().totalPlayedTimeMs)
                  : placeholder
              }
            />
            <StatRow
              label="Data range"
              value={
                timeIndex().minDay && timeIndex().maxDay
                  ? `${dateLib.formatDate(timeIndex().minDay, 'medium')} - ${dateLib.formatDate(timeIndex().maxDay, 'medium')}`
                  : placeholder
              }
            />
            <StatRow
              label="Artists"
              value={artistsInfo().totalArtists ? artistsInfo().totalArtists.toLocaleString() : placeholder}
            />
            <StatRow
              label="Albums"
              value={artistsInfo().totalAlbums ? artistsInfo().totalAlbums.toLocaleString() : placeholder}
            />
            <StatRow
              label="Tracks"
              value={
                artistsInfo().uniqueTracksCount
                  ? artistsInfo().uniqueTracksCount.toLocaleString()
                  : placeholder
              }
            />
            <StatRow
              label="Uploaded at"
              value={s()?.metadata?.uploadedAt ? formatDate(s()!.metadata!.uploadedAt) : placeholder}
            />
          </div>
        </Card>

        <Card>
          <h2 class="text-text-strong text-lg font-semibold">Danger zone</h2>
          <p class="text-text-muted text-sm">
            This will permanently delete all your uploaded streaming history from this
            browser. You will need to re-upload your data to use the app again.
          </p>
          <button
            type="button"
            onClick={handleClearData}
            disabled={isClearing()}
            class="bg-danger hover:bg-danger-hover mt-2 w-full rounded-lg px-4 py-3 font-medium text-white transition-colors disabled:opacity-50"
          >
            {isClearing() ? 'Clearing...' : 'Clear all data'}
          </button>
        </Card>
      </div>
    </div>
  )
}

const StatRow = (props: {label: string; value: string}) => (
  <div class="flex flex-col">
    <span class="text-text-muted text-sm">{props.label}</span>
    <span class="text-text-strong font-medium">{props.value}</span>
  </div>
)

export default SettingsPage
