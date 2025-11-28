import {Show} from 'solid-js'
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

  return (
    <div class="mx-auto w-full max-w-2xl px-5 py-8">
      <h1 class="text-text-strong mb-6 text-2xl font-bold">Manage your data</h1>

      <Show when={stats()} fallback={<div class="text-text-muted">Loading...</div>}>
        {(s) => (
          <div class="flex flex-col gap-6">
            <Card>
              <h2 class="text-text-strong text-lg font-semibold">Your data</h2>
              <div class="grid grid-cols-2 gap-4">
                <StatRow label="Entries" value={s().entryCount.toLocaleString()} />
                <StatRow
                  label="Estimated size"
                  value={formatBytes(s().estimatedSizeBytes)}
                />
                <StatRow
                  label="Total listening time"
                  value={dateLib.msToHMS(artistsInfo().totalPlayedTimeMs)}
                />
                <Show when={timeIndex().minDay && timeIndex().maxDay}>
                  <StatRow
                    label="Data range"
                    value={`${dateLib.formatDate(timeIndex().minDay, 'medium')} - ${dateLib.formatDate(timeIndex().maxDay, 'medium')}`}
                  />
                </Show>
                <StatRow
                  label="Artists"
                  value={artistsInfo().totalArtists.toLocaleString()}
                />
                <StatRow
                  label="Albums"
                  value={artistsInfo().totalAlbums.toLocaleString()}
                />
                <StatRow
                  label="Tracks"
                  value={artistsInfo().uniqueTracksCount.toLocaleString()}
                />
                <Show when={s().metadata?.uploadedAt}>
                  {(uploadedAt) => (
                    <StatRow label="Uploaded at" value={formatDate(uploadedAt())} />
                  )}
                </Show>
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
        )}
      </Show>
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
