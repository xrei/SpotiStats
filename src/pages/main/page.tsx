import {Navigate} from '@solidjs/router'
import {useUnit} from 'effector-solid'
import {Match, Show, Switch} from 'solid-js'
import {FileUpload} from './ui/FileUpload'
import {Loading} from '@/shared/ui'
import {mainPageModel} from './model'

const MainPage = () => {
  const {filesSelected, $uploadProgress, $shouldRedirect, $hasData, $isInitialized, uploadPending, initialHasData} =
    mainPageModel
  const [uploadProgress, shouldRedirect, hasData, isInitialized, isPending] = useUnit([
    $uploadProgress,
    $shouldRedirect,
    $hasData,
    $isInitialized,
    uploadPending,
  ])

  const progress = () => uploadProgress()

  // After initialization, if no data - show upload UI (handles clear data case)
  // initialHasData is stale after clear, so we check actual state
  const showLoading = () => initialHasData && !isInitialized()
  const shouldShowUpload = () => !initialHasData || (isInitialized() && !hasData())

  return (
    <>
      <Show when={shouldRedirect()}>
        <Navigate href="/artists" />
      </Show>
      <Show when={showLoading()}>
        <Loading />
      </Show>
      <Show when={shouldShowUpload()}>
        <UploadContent
          filesSelected={filesSelected}
          progress={progress}
          isPending={isPending}
        />
      </Show>
    </>
  )
}

// Extracted to component so it renders immediately for fresh users
function UploadContent(props: {
  filesSelected: (files: File[]) => void
  progress: () => {status: string; filesProcessed: number; totalFiles: number; validEntries: number; errorMessage: string | null}
  isPending: () => boolean
}) {
  return (
    <div class="mx-auto flex flex-1 w-full max-w-2xl flex-col px-4 py-6 sm:py-10 lg:px-8">
      <div class="border-line/50 bg-surface-1 shadow-accent/5 my-auto flex w-full flex-col rounded-2xl border p-8 shadow-2xl sm:p-10">
        <div class="mb-8 text-center">
          <h1 class="animated-gradient-text mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Upload Your Spotify Data
          </h1>
          <p class="text-text-muted mb-3 text-sm">Discover insights from your listening history</p>
          <p class="text-text-dim text-xs">
            Total play time • Top artists • Peak activity • Listening trends
          </p>
        </div>

        <Switch>
          <Match when={props.isPending()}>
            <UploadProgress progress={props.progress()} />
          </Match>
          <Match when={props.progress().status === 'complete'}>
            <UploadComplete validEntries={props.progress().validEntries} />
          </Match>
          <Match when={true}>
            <FileUpload onFilesSelected={props.filesSelected} accept=".json" multiple />

            <div class="mt-12 space-y-3">
              <p class="text-text-dim text-xs font-medium uppercase tracking-wider">
                How to get your data
              </p>
              <ol class="space-y-2 text-sm opacity-60">
                <li class="flex gap-3">
                  <span class="text-accent font-medium opacity-100">1.</span>
                  <a
                    href="https://www.spotify.com/account/privacy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-text-strong underline underline-offset-2 hover:text-accent"
                  >
                    Go to your Spotify Account privacy settings
                  </a>
                </li>
                <li class="flex gap-3">
                  <span class="text-accent font-medium opacity-100">2.</span>
                  <span class="text-text-muted">Request "Extended streaming history"</span>
                </li>
                <li class="flex gap-3">
                  <span class="text-accent font-medium opacity-100">3.</span>
                  <span class="text-text-muted">Wait for email (takes a few days)</span>
                </li>
                <li class="flex gap-3">
                  <span class="text-accent font-medium opacity-100">4.</span>
                  <span class="text-text-muted">Upload all JSON files here</span>
                </li>
              </ol>
            </div>

            <Show when={props.progress().status === 'error'}>
              <div class="border-danger/30 bg-danger/10 mt-6 rounded-xl border p-4">
                <p class="text-sm font-medium text-red-300">{props.progress().errorMessage}</p>
              </div>
            </Show>
          </Match>
        </Switch>
      </div>
    </div>
  )
}

function UploadProgress(props: {progress: {status: string; filesProcessed: number; totalFiles: number; validEntries: number}}) {
  return (
    <div class="flex flex-1 flex-col items-center justify-center py-16">
      <div class="bg-accent/10 mb-6 rounded-full p-6">
        <div class="text-4xl">⏳</div>
      </div>
      <p class="text-text-strong mb-8 text-lg font-medium">
        {props.progress.status === 'uploading' && 'Reading files...'}
        {props.progress.status === 'validating' && 'Validating entries...'}
      </p>

      <div class="w-full max-w-xs space-y-4">
        <div class="text-text-muted flex justify-between text-sm">
          <span>Progress</span>
          <span class="text-text-strong font-medium">
            {props.progress.filesProcessed} / {props.progress.totalFiles} files
          </span>
        </div>

        <div class="bg-surface-2 h-1.5 overflow-hidden rounded-full">
          <div
            class="from-accent to-accent-3 h-full rounded-full bg-gradient-to-r transition-all duration-500"
            style={{
              width: `${props.progress.totalFiles > 0 ? (props.progress.filesProcessed / props.progress.totalFiles) * 100 : 0}%`,
            }}
          />
        </div>

        <Show when={props.progress.validEntries > 0}>
          <p class="text-text-dim text-center text-xs">
            {props.progress.validEntries.toLocaleString()} entries found
          </p>
        </Show>
      </div>
    </div>
  )
}

function UploadComplete(props: {validEntries: number}) {
  return (
    <div class="flex flex-1 flex-col items-center justify-center py-16">
      <div class="mb-6 rounded-full bg-green-500/10 p-6">
        <div class="text-4xl">✓</div>
      </div>
      <p class="text-text-strong mb-2 text-xl font-semibold">Processing data...</p>
      <p class="text-text-muted text-sm">
        {props.validEntries.toLocaleString()} listening records loaded
      </p>
    </div>
  )
}

export default MainPage
