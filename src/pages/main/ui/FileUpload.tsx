import {createSignal} from 'solid-js'
import clsx from 'clsx'

type FileUploadProps = {
  onFilesSelected: (files: File[]) => void
  accept?: string
  multiple?: boolean
}

export const FileUpload = (props: FileUploadProps) => {
  let inputRef!: HTMLInputElement
  const [isDragging, setIsDragging] = createSignal(false)

  return (
    <>
      <div
        class={clsx(
          'group relative cursor-pointer overflow-hidden rounded-lg p-14 text-center transition-all duration-200',
          isDragging()
            ? 'border-2 border-solid border-accent bg-surface-2/90'
            : 'border-2 border-dashed border-line/50 bg-surface-2/40 hover:border-solid hover:border-accent/60 hover:bg-surface-2/60',
        )}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          const files = e.dataTransfer?.files
          if (files && files.length > 0) {
            const fileList = Array.from(files)
            const accept = props.accept
            if (accept) {
              const acceptedFiles = fileList.filter((f) =>
                f.name.endsWith(accept.replace('.', '')),
              )
              if (acceptedFiles.length > 0) {
                props.onFilesSelected(acceptedFiles)
              }
            } else {
              props.onFilesSelected(fileList)
            }
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragging(false)
          }
        }}
        onClick={() => inputRef.click()}
      >
        <div class="relative">
          <WaveformIcon class="text-text-dim/50 group-hover:text-text-dim mx-auto mb-4 size-14 transition-colors" />
          <p class="text-text-strong mb-1 text-lg font-medium">
            Drop your JSON files here
          </p>
          <p class="text-text-muted text-sm">
            or <span class="text-accent group-hover:underline">browse</span> to select
            files
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={props.accept}
        multiple={props.multiple}
        class="hidden"
        onChange={(e) => {
          const files = e.currentTarget.files
          if (files && files.length > 0) {
            props.onFilesSelected(Array.from(files))
          }
        }}
      />
    </>
  )
}

const WaveformIcon = (props: {class?: string}) => (
  <svg viewBox="0 0 44 40" fill="none" class={props.class}>
    <rect x="2" y="16" width="5" height="8" rx="2" fill="currentColor" />
    <rect x="11" y="10" width="5" height="20" rx="2" fill="currentColor" />
    <rect x="20" y="4" width="5" height="32" rx="2" fill="currentColor" />
    <rect x="29" y="8" width="5" height="24" rx="2" fill="currentColor" />
    <rect x="38" y="14" width="5" height="12" rx="2" fill="currentColor" />
  </svg>
)
