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
        class="mb-6 cursor-pointer rounded-lg border-2 border-dashed border-gray-600 bg-gray-800 p-12 text-center transition-colors hover:border-gray-500 hover:bg-gray-750"
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
        <div class="mb-4 text-6xl">📁</div>
        <p class="mb-2 text-lg font-medium">
          Drop your JSON files here or click to browse
        </p>
        <p class="text-sm text-gray-400">
          Select all your Extended Streaming History JSON files
        </p>
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
