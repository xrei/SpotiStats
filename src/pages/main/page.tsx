import {Navigate} from '@solidjs/router'
import {useUnit} from 'effector-solid'
import {Show} from 'solid-js'
import {Card} from '@/shared/ui/Card'
import {FileUpload} from './ui/FileUpload'
import {mainPageModel} from './model'

const MainPage = () => {
  const {filesSelected, $uploadProgress, $shouldRedirect, uploadPending} = mainPageModel
  const [uploadProgress, shouldRedirect, isPending] = useUnit([
    $uploadProgress,
    $shouldRedirect,
    uploadPending,
  ])

  const progress = () => uploadProgress()

  return (
    <Show when={!shouldRedirect()} fallback={<Navigate href="/artists" />}>
      <div class="flex h-full flex-col items-center justify-center p-6">
        <Card class="w-full max-w-2xl p-8">
          <h1 class="mb-6 text-3xl font-bold">Upload Your Spotify Data</h1>

          <Show when={!isPending()}>
            <FileUpload onFilesSelected={filesSelected} accept=".json" multiple />

            <div class="rounded-lg bg-gray-800 p-4">
              <p class="mb-2 text-sm font-medium">How to get your data:</p>
              <ol class="list-inside list-decimal space-y-1 text-sm text-gray-400">
                <li>Go to your Spotify Account page</li>
                <li>Privacy Settings → Download your data</li>
                <li>
                  Request "Extended streaming history" (takes a few days to receive)
                </li>
                <li>Upload all JSON files from the download</li>
              </ol>
            </div>
          </Show>

          <Show when={isPending()}>
            <div class="mb-6 space-y-4">
              <div class="text-center">
                <div class="mb-4 text-4xl">⏳</div>
                <p class="text-lg font-medium">
                  {progress().status === 'uploading' && 'Reading files...'}
                  {progress().status === 'validating' && 'Validating entries...'}
                  {progress().status === 'persisting' && 'Saving data...'}
                </p>
              </div>

              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>Files processed:</span>
                  <span class="font-medium">
                    {progress().filesProcessed} / {progress().totalFiles}
                  </span>
                </div>

                <Show when={progress().validEntries > 0}>
                  <div class="flex justify-between text-sm">
                    <span>Valid entries:</span>
                    <span class="font-medium text-green-400">
                      {progress().validEntries.toLocaleString()}
                    </span>
                  </div>
                </Show>

                <Show when={progress().invalidEntries > 0}>
                  <div class="flex justify-between text-sm">
                    <span>Invalid entries (skipped):</span>
                    <span class="font-medium text-yellow-400">
                      {progress().invalidEntries.toLocaleString()}
                    </span>
                  </div>
                </Show>
              </div>

              <div class="h-2 overflow-hidden rounded-full bg-gray-700">
                <div
                  class="h-full bg-green-500 transition-all duration-300"
                  style={{
                    width: `${progress().totalFiles > 0 ? (progress().filesProcessed / progress().totalFiles) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </Show>

          <Show when={progress().status === 'error'}>
            <div class="mt-4 rounded-lg bg-red-900/50 p-4">
              <p class="font-medium text-red-300">Error</p>
              <p class="text-sm text-red-200">{progress().errorMessage}</p>
            </div>
          </Show>

          <Show when={progress().status === 'complete'}>
            <div class="mt-4 space-y-4 rounded-lg bg-green-900/50 p-4">
              <div>
                <p class="font-medium text-green-300">Upload complete!</p>
                <p class="text-sm text-green-200">
                  Loaded {progress().validEntries.toLocaleString()} entries
                  {progress().invalidEntries > 0 &&
                    ` (skipped ${progress().invalidEntries} invalid)`}
                </p>
              </div>
              <Navigate href="/artists" />
            </div>
          </Show>
        </Card>
      </div>
    </Show>
  )
}

export default MainPage
