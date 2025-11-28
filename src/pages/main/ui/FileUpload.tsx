type FileUploadProps = {
  onFilesSelected: (files: File[]) => void
  accept?: string
  multiple?: boolean
}

export const FileUpload = (props: FileUploadProps) => {
  let inputRef!: HTMLInputElement

  return (
    <>
      <div
        class="group bg-surface-2/60 hover:bg-surface-2/80 hover:ring-accent/20 relative cursor-pointer overflow-hidden rounded-xl p-14 text-center ring-1 ring-white/3 transition-all duration-300 ring-inset"
        onDrop={(e) => {
          e.preventDefault()
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
        onClick={() => inputRef.click()}
      >
        <div class="from-accent/5 pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div class="relative">
          <div class="text-text-dim/60 group-hover:text-text-dim mx-auto mb-4 text-6xl transition-colors">
            📁
          </div>
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
